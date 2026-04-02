import { pool } from '../db/index.js';
import { evaluateQuest } from '../services/questEngine.js';
import { fail, ok } from '../utils/response.js';

export async function listQuests(req, res) {
  const row = await pool.query(
    `SELECT q.*, uq.status, uq.progress, uq.started_at, uq.ends_at, uq.completed_at
     FROM quests q
     LEFT JOIN user_quests uq ON uq.quest_id = q.id AND uq.user_id = $1
     ORDER BY q.recurrence, q.difficulty`,
    [req.user.id]
  );
  return ok(res, row.rows);
}

export async function joinQuest(req, res) {
  const quest = await pool.query('SELECT * FROM quests WHERE id = $1', [req.params.id]);
  if (!quest.rowCount) return fail(res, 'Quest not found', 404);

  const row = await pool.query(
    `INSERT INTO user_quests (user_id, quest_id, progress, ends_at)
     VALUES ($1,$2,$3, NOW() + (INTERVAL '1 day' * $4))
     ON CONFLICT DO NOTHING RETURNING *`,
    [req.user.id, req.params.id, JSON.stringify({ current: 0, target: 1 }), quest.rows[0].duration_days || 7]
  );
  return ok(res, row.rows[0] || { joined: true });
}

export async function evaluateQuestById(req, res) {
  const result = await evaluateQuest(req.user.id, req.params.id);
  return ok(res, result);
}
