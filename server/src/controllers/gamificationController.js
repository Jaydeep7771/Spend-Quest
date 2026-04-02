import { pool } from '../db/index.js';
import { ok } from '../utils/response.js';

export async function xp(req, res) {
  const row = await pool.query('SELECT * FROM user_xp WHERE user_id = $1', [req.user.id]);
  return ok(res, row.rows[0] || null);
}

export async function badges(req, res) {
  const row = await pool.query(
    `SELECT b.*, (ub.user_id IS NOT NULL) AS earned, ub.earned_at
     FROM badges b LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
     ORDER BY b.name`,
    [req.user.id]
  );
  return ok(res, row.rows);
}

export async function quests(req, res) {
  const row = await pool.query('SELECT * FROM user_quests WHERE user_id = $1 ORDER BY started_at DESC', [req.user.id]);
  return ok(res, row.rows);
}

export async function streaks(req, res) {
  const row = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [req.user.id]);
  return ok(res, row.rows[0] || null);
}
