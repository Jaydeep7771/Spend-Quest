import crypto from 'node:crypto';
import { pool } from '../db/index.js';
import { getLeaderboard } from '../services/leaderboardService.js';
import { fail, ok } from '../utils/response.js';

export async function leaderboard(req, res) {
  const type = req.query.type || 'weekly';
  const scope = req.query.scope || 'global';
  const data = await getLeaderboard(req.user.id, type, scope);
  return ok(res, data);
}

export async function createSquad(req, res) {
  const inviteCode = crypto.randomBytes(4).toString('hex');
  const row = await pool.query(
    `INSERT INTO squads (name, invite_code, created_by) VALUES ($1,$2,$3) RETURNING *`,
    [req.body.name || 'My Squad', inviteCode, req.user.id]
  );
  await pool.query('INSERT INTO squad_members (squad_id, user_id) VALUES ($1,$2)', [row.rows[0].id, req.user.id]);
  return ok(res, row.rows[0], 201);
}

export async function getSquad(req, res) {
  const squad = await pool.query('SELECT * FROM squads WHERE id = $1', [req.params.id]);
  if (!squad.rowCount) return fail(res, 'Squad not found', 404);
  const members = await pool.query(
    `SELECT u.id, u.name, u.avatar_url FROM squad_members sm JOIN users u ON u.id = sm.user_id WHERE sm.squad_id = $1`,
    [req.params.id]
  );
  return ok(res, { ...squad.rows[0], members: members.rows });
}

export async function joinSquad(req, res) {
  const squad = await pool.query('SELECT * FROM squads WHERE invite_code = $1', [req.body.invite_code]);
  if (!squad.rowCount) return fail(res, 'Invalid invite code', 404);
  await pool.query('INSERT INTO squad_members (squad_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [squad.rows[0].id, req.user.id]);
  return ok(res, { joined: true, squad_id: squad.rows[0].id });
}

export async function createArenaChallenge(req, res) {
  const { opponent_id, category, period } = req.body;
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + (period === 'monthly' ? 30 : 7));

  const row = await pool.query(
    `INSERT INTO arena_challenges (challenger_id, opponent_id, category, period_start, period_end, status)
     VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
    [req.user.id, opponent_id, category, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
  return ok(res, row.rows[0], 201);
}

export async function getArenaChallenge(req, res) {
  const row = await pool.query('SELECT * FROM arena_challenges WHERE id = $1', [req.params.id]);
  if (!row.rowCount) return fail(res, 'Challenge not found', 404);
  return ok(res, row.rows[0]);
}

export async function acceptArenaChallenge(req, res) {
  const row = await pool.query(
    `UPDATE arena_challenges SET status = 'active'
     WHERE id = $1 AND opponent_id = $2 RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (!row.rowCount) return fail(res, 'Challenge not found', 404);
  return ok(res, row.rows[0]);
}
