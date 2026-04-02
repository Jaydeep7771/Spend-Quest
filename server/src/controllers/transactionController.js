import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { pool } from '../db/index.js';
import { categorizeMerchants } from '../services/claudeService.js';
import { parseSMS } from '../services/smsParser.js';
import { awardXP, XP_EVENTS } from '../services/xpEngine.js';
import { fail, ok } from '../utils/response.js';

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

export async function listTransactions(req, res) {
  const { page = 1, limit = 20, category, account, from, to, search } = req.query;
  const params = [req.user.id];
  const where = ['user_id = $1'];

  if (category) { params.push(category); where.push(`category = $${params.length}`); }
  if (account) { params.push(account); where.push(`account_id = $${params.length}`); }
  if (from) { params.push(from); where.push(`tx_date >= $${params.length}`); }
  if (to) { params.push(to); where.push(`tx_date <= $${params.length}`); }
  if (search) { params.push(`%${search}%`); where.push(`COALESCE(plain_label, merchant_raw, '') ILIKE $${params.length}`); }

  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  const result = await pool.query(
    `SELECT * FROM transactions WHERE ${where.join(' AND ')}
     ORDER BY tx_date DESC, created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return ok(res, { page: Number(page), limit: Number(limit), items: result.rows });
}

export async function createTransaction(req, res) {
  const { amount, type, merchant_raw, account_id, tx_date, category, plain_label } = req.body;
  if (!amount || Number(amount) <= 0) return fail(res, 'amount must be positive');
  if (!['debit', 'credit'].includes(type)) return fail(res, 'type must be debit or credit');

  const row = await pool.query(
    `INSERT INTO transactions (user_id, account_id, amount, type, merchant_raw, tx_date, category, plain_label, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'manual') RETURNING *`,
    [req.user.id, account_id || null, amount, type, merchant_raw || '', tx_date, category || 'other', plain_label || merchant_raw]
  );

  await awardXP(req.user.id, 'TRANSACTION_REVIEWED', { transaction_id: row.rows[0].id });
  return ok(res, row.rows[0], 201);
}

export async function updateTransaction(req, res) {
  const row = await pool.query(
    `UPDATE transactions SET note = $1, tags = $2, category = COALESCE($3, category)
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [req.body.note || null, req.body.tags || null, req.body.category || null, req.params.id, req.user.id]
  );
  if (!row.rowCount) return fail(res, 'Transaction not found', 404);
  return ok(res, row.rows[0]);
}

export async function deleteTransaction(req, res) {
  const row = await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
  if (!row.rowCount) return fail(res, 'Transaction not found', 404);
  return ok(res, { id: row.rows[0].id });
}

export async function importSMS(req, res) {
  const smsList = Array.isArray(req.body.sms) ? req.body.sms : [];
  const parsed = smsList.map((txt) => parseSMS(txt)).filter(Boolean);
  if (!parsed.length) return fail(res, 'No transaction SMS found');

  const categories = await categorizeMerchants(parsed.map((p) => p.merchant || 'unknown'));
  const inserted = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    const cat = categories[i];
    const row = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, merchant_raw, merchant_clean, merchant_hash, category, subcategory, plain_label, source, raw_sms, tx_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'sms',$10,$11) RETURNING *`,
      [req.user.id, item.amount, item.type, item.merchant, cat.merchant_clean, cat.merchant_hash, cat.category, cat.subcategory, cat.plain_label, item.raw_sms, item.date]
    );
    inserted.push(row.rows[0]);
  }
  return ok(res, { count: inserted.length, items: inserted }, 201);
}

export async function importCSV(req, res) {
  if (!req.file || req.file.mimetype !== 'text/csv') return fail(res, 'Upload a CSV file only');
  const records = parse(req.file.buffer.toString('utf-8'), { columns: true, skip_empty_lines: true });
  const inserted = [];
  for (const r of records) {
    const amount = Number(r.amount);
    if (!amount || amount <= 0) continue;
    const row = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, merchant_raw, tx_date, category, plain_label, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'csv') RETURNING *`,
      [req.user.id, amount, r.type === 'credit' ? 'credit' : 'debit', r.merchant_raw || '', r.tx_date, r.category || 'other', r.plain_label || r.merchant_raw]
    );
    inserted.push(row.rows[0]);
  }
  return ok(res, { count: inserted.length, items: inserted }, 201);
}

export async function summary(req, res) {
  const period = req.query.period || 'month';
  const interval = period === 'week' ? "INTERVAL '7 days'" : period === 'year' ? "INTERVAL '1 year'" : "INTERVAL '1 month'";

  const row = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) AS debit_total,
      COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0) AS credit_total
     FROM transactions
     WHERE user_id = $1 AND tx_date >= CURRENT_DATE - ${interval}`,
    [req.user.id]
  );

  return ok(res, { period, ...row.rows[0] });
}

export async function categories(req, res) {
  const row = await pool.query(
    `SELECT category, COALESCE(SUM(amount),0)::numeric(10,2) AS total
     FROM transactions WHERE user_id = $1 AND type = 'debit'
     GROUP BY category ORDER BY total DESC`,
    [req.user.id]
  );
  return ok(res, row.rows);
}

export async function reviewTransaction(req, res) {
  if (!XP_EVENTS.TRANSACTION_REVIEWED) return fail(res, 'XP config missing', 500);
  await awardXP(req.user.id, 'TRANSACTION_REVIEWED', { transaction_id: req.params.id });
  return ok(res, { reviewed: true, transaction_id: req.params.id });
}
