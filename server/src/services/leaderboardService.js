import { createClient } from 'redis';
import { pool } from '../db/index.js';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(() => null);

/**
 * Get leaderboard rows for global/squad scope.
 * @param {string} userId
 * @param {'weekly'|'monthly'} type
 * @param {'global'|'squad'} scope
 */
export async function getLeaderboard(userId, type = 'weekly', scope = 'global') {
  const key = `leaderboard:${scope}:${type}`;
  const cached = await redis.zRangeWithScores(key, 0, 49, { REV: true });
  if (cached.length) return cached;

  const metric = type === 'monthly' ? 'monthly_xp' : 'weekly_xp';
  const rows = await pool.query(
    `SELECT u.id, u.name, ux.level, ux.level_name, ux.${metric} AS xp
     FROM user_xp ux JOIN users u ON u.id = ux.user_id
     ORDER BY ux.${metric} DESC NULLS LAST LIMIT 50`
  );

  if (rows.rowCount) {
    const members = rows.rows.flatMap((r) => [r.xp || 0, JSON.stringify(r)]);
    await redis.zAdd(key, rows.rows.map((r) => ({ score: Number(r.xp || 0), value: JSON.stringify(r) })));
    await redis.expire(key, 60);
    return rows.rows;
  }
  return [];
}
