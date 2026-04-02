import { pool } from '../db/index.js';
import { awardXP } from './xpEngine.js';
import { emitToUser } from './notificationService.js';

/**
 * Evaluate user quest progress and completion.
 * @param {string} userId
 * @param {string} questId
 */
export async function evaluateQuest(userId, questId) {
  const questRes = await pool.query('SELECT * FROM quests WHERE id = $1', [questId]);
  if (!questRes.rowCount) throw new Error('Quest not found');
  const quest = questRes.rows[0];

  const userQuest = await pool.query('SELECT * FROM user_quests WHERE user_id = $1 AND quest_id = $2 ORDER BY started_at DESC LIMIT 1', [userId, questId]);
  if (!userQuest.rowCount) throw new Error('User quest not joined');

  const txRes = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total, COUNT(*)::int AS count
     FROM transactions WHERE user_id = $1 AND type='debit' AND tx_date BETWEEN $2::date AND COALESCE($3::date, CURRENT_DATE)`,
    [userId, userQuest.rows[0].started_at, userQuest.rows[0].ends_at]
  );

  const condition = quest.condition || {};
  const current = Number(txRes.rows[0].total);
  const target = Number(condition.limit || 1);
  const completed = quest.type === 'spending_limit' ? current <= target : Number(txRes.rows[0].count) >= target;

  await pool.query('UPDATE user_quests SET progress = $1, status = $2, completed_at = CASE WHEN $2 = $3 THEN NOW() ELSE completed_at END WHERE id = $4', [
    { current, target },
    completed ? 'completed' : 'active',
    'completed',
    userQuest.rows[0].id
  ]);

  if (completed) {
    await awardXP(userId, quest.difficulty === 'hard' ? 'QUEST_HARD' : quest.difficulty === 'medium' ? 'QUEST_MEDIUM' : 'QUEST_EASY', { quest_id: questId });
    emitToUser(userId, 'quest_completed', { quest_id: quest.id, title: quest.title, xp_reward: quest.xp_reward });
  }

  return { quest_id: questId, completed, progress: { current, target } };
}
