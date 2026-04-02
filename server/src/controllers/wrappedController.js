import { pool } from '../db/index.js';
import { ok } from '../utils/response.js';

async function generateWrapped(userId, year, month) {
  const totals = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) AS spent,
      COUNT(*)::int AS tx_count,
      COALESCE(MAX(amount),0) AS biggest_tx
     FROM transactions
     WHERE user_id = $1 AND EXTRACT(YEAR FROM tx_date) = $2 AND EXTRACT(MONTH FROM tx_date) = $3`,
    [userId, year, month]
  );

  const topCategory = await pool.query(
    `SELECT category, SUM(amount) AS total FROM transactions
     WHERE user_id = $1 AND type = 'debit' AND EXTRACT(YEAR FROM tx_date) = $2 AND EXTRACT(MONTH FROM tx_date) = $3
     GROUP BY category ORDER BY total DESC LIMIT 1`,
    [userId, year, month]
  );

  return { ...totals.rows[0], top_category: topCategory.rows[0] || null, year, month };
}

export async function getOrGenerateWrapped(req, res) {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  const existing = await pool.query('SELECT * FROM spend_wrapped WHERE user_id = $1 AND year = $2 AND month = $3', [req.user.id, year, month]);
  if (existing.rowCount) return ok(res, existing.rows[0]);

  const data = await generateWrapped(req.user.id, year, month);
  const row = await pool.query('INSERT INTO spend_wrapped (user_id, month, year, data) VALUES ($1,$2,$3,$4) RETURNING *', [req.user.id, month, year, data]);
  return ok(res, row.rows[0], 201);
}
