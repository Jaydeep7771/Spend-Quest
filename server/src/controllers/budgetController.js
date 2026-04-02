import { pool } from '../db/index.js';
import { fail, ok } from '../utils/response.js';

export async function listBudgets(req, res) {
  const row = await pool.query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  return ok(res, row.rows);
}

export async function createBudget(req, res) {
  const { category, amount, period = 'monthly', start_date, end_date, alert_at_percent = 80 } = req.body;
  if (!category || !amount || Number(amount) <= 0) return fail(res, 'Invalid category or amount');

  const row = await pool.query(
    `INSERT INTO budgets (user_id, category, amount, period, start_date, end_date, alert_at_percent)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.id, category, amount, period, start_date, end_date, alert_at_percent]
  );
  return ok(res, row.rows[0], 201);
}

export async function updateBudget(req, res) {
  const row = await pool.query(
    `UPDATE budgets SET amount = $1, alert_at_percent = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
    [req.body.amount, req.body.alert_at_percent, req.params.id, req.user.id]
  );
  if (!row.rowCount) return fail(res, 'Budget not found', 404);
  return ok(res, row.rows[0]);
}

export async function deleteBudget(req, res) {
  const row = await pool.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
  if (!row.rowCount) return fail(res, 'Budget not found', 404);
  return ok(res, row.rows[0]);
}

export async function budgetStatus(req, res) {
  const row = await pool.query(
    `SELECT b.*, COALESCE(t.spent, 0) AS spent,
      CASE WHEN b.amount > 0 THEN ROUND((COALESCE(t.spent,0)/b.amount)*100,2) ELSE 0 END AS percent_used
     FROM budgets b
     LEFT JOIN (
       SELECT category, SUM(amount) AS spent
       FROM transactions
       WHERE user_id = $1 AND type='debit' AND tx_date BETWEEN date_trunc('month', CURRENT_DATE) AND CURRENT_DATE
       GROUP BY category
     ) t ON b.category=t.category
     WHERE b.user_id = $1`,
    [req.user.id]
  );
  return ok(res, row.rows);
}
