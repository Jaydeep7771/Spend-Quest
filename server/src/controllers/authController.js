import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';
import { fail, ok } from '../utils/response.js';
import {
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/tokens.js';

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return fail(res, 'name, email, password are required');

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount) return fail(res, 'Email already in use', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, onboarding_complete, created_at`,
    [name, email.toLowerCase(), passwordHash, phone || null]
  );

  await pool.query('INSERT INTO user_xp (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.rows[0].id]);
  await pool.query('INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.rows[0].id]);

  const payload = { id: user.rows[0].id, email: user.rows[0].email };
  setRefreshCookie(res, signRefreshToken(payload));
  return ok(res, { user: user.rows[0], access_token: signAccessToken(payload) }, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'email and password are required');

  const userRes = await pool.query(
    `SELECT id, name, email, phone, onboarding_complete, password_hash
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  if (!userRes.rowCount) return fail(res, 'Invalid credentials', 401);

  const user = userRes.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return fail(res, 'Invalid credentials', 401);

  const payload = { id: user.id, email: user.email };
  setRefreshCookie(res, signRefreshToken(payload));
  delete user.password_hash;
  return ok(res, { user, access_token: signAccessToken(payload) });
}

export async function me(req, res) {
  const user = await pool.query(
    `SELECT id, name, email, phone, avatar_url, onboarding_complete, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  return ok(res, user.rows[0] || null);
}

export async function refresh(req, res) {
  const token = req.cookies.refresh_token;
  if (!token) return fail(res, 'Missing refresh token', 401);

  try {
    const payload = verifyRefreshToken(token);
    const nextPayload = { id: payload.id, email: payload.email };
    setRefreshCookie(res, signRefreshToken(nextPayload));
    return ok(res, { access_token: signAccessToken(nextPayload) });
  } catch {
    return fail(res, 'Invalid refresh token', 401);
  }
}

export function logout(_req, res) {
  res.clearCookie('refresh_token');
  return ok(res, { logged_out: true });
}
