import { pool } from '../db/index.js';
import { emitToUser } from './notificationService.js';

export const XP_EVENTS = {
  TRANSACTION_REVIEWED: 5,
  BUDGET_UNDER_80: 20,
  BUDGET_UNDER_100: 10,
  NO_SPEND_DAY: 50,
  STREAK_7_DAY: 100,
  STREAK_30_DAY: 500,
  QUEST_EASY: 75,
  QUEST_MEDIUM: 150,
  QUEST_HARD: 300,
  BADGE_EARNED: 50,
  WEEKLY_REVIEW: 25,
  MONTHLY_WRAPPED: 100,
  INVITE_FRIEND: 200
};

const LEVELS = [
  { level: 1, min: 0, name: 'Rookie Saver' },
  { level: 2, min: 500, name: 'Budget Apprentice' },
  { level: 3, min: 1500, name: 'XP Grinder' },
  { level: 4, min: 3500, name: 'Finance Ninja' },
  { level: 5, min: 7500, name: 'Wealth Warrior' },
  { level: 6, min: 15000, name: 'SpendQuest Legend' }
];

function levelForXP(xp) {
  return [...LEVELS].reverse().find((l) => xp >= l.min) || LEVELS[0];
}

/**
 * Award XP and emit real-time events.
 * @param {string} userId
 * @param {keyof XP_EVENTS} eventType
 * @param {Record<string, any>} metadata
 */
export async function awardXP(userId, eventType, metadata = {}) {
  const xpAwarded = XP_EVENTS[eventType] || 0;
  await pool.query('INSERT INTO xp_events (user_id, event_type, xp_awarded, metadata) VALUES ($1,$2,$3,$4)', [userId, eventType, xpAwarded, metadata]);

  const current = await pool.query('SELECT * FROM user_xp WHERE user_id = $1', [userId]);
  const before = current.rows[0] || { total_xp: 0, level: 1, weekly_xp: 0, monthly_xp: 0 };
  const newTotal = Number(before.total_xp) + xpAwarded;
  const next = levelForXP(newTotal);

  await pool.query(
    `INSERT INTO user_xp (user_id, total_xp, level, level_name, weekly_xp, monthly_xp)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (user_id)
     DO UPDATE SET total_xp=$2, level=$3, level_name=$4, weekly_xp=$5, monthly_xp=$6`,
    [userId, newTotal, next.level, next.name, Number(before.weekly_xp) + xpAwarded, Number(before.monthly_xp) + xpAwarded]
  );

  const levelChanged = next.level !== Number(before.level);
  emitToUser(userId, 'xp_awarded', { amount: xpAwarded, event_type: eventType, new_total: newTotal, level_changed: levelChanged });
  if (levelChanged) emitToUser(userId, 'level_up', { new_level: next.level, level_name: next.name, xp_reward: xpAwarded });

  return { xp_awarded: xpAwarded, new_total: newTotal, level_changed: levelChanged, new_level: next.level };
}
