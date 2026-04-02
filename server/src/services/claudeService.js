import crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../db/index.js';

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const allowed = new Set(['food', 'transport', 'entertainment', 'shopping', 'health', 'utilities', 'education', 'travel', 'subscription', 'investment', 'other']);

function hashMerchant(value) {
  return crypto.createHash('sha256').update((value || '').trim().toLowerCase()).digest('hex');
}

/**
 * Categorize a single merchant string with PostgreSQL cache + Claude fallback.
 * @param {string} merchantRaw
 */
export async function categorizeMerchant(merchantRaw) {
  const cleanInput = String(merchantRaw || '').replace(/[<>]/g, '').trim();
  const merchantHash = hashMerchant(cleanInput);

  const cached = await pool.query('SELECT * FROM merchant_category_cache WHERE merchant_hash = $1', [merchantHash]);
  if (cached.rowCount) return { ...cached.rows[0], merchant_hash: merchantHash };

  let payload = { merchant_clean: cleanInput || 'Unknown', category: 'other', subcategory: 'other', plain_label: `${cleanInput || 'Unknown'} transaction` };

  if (anthropic && cleanInput) {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: `You are a financial transaction categorizer for Indian users. Return JSON only with merchant_clean,category,subcategory,plain_label. Transaction: ${cleanInput}` }]
    });
    const text = msg.content?.[0]?.text || '{}';
    try {
      const parsed = JSON.parse(text);
      payload = {
        merchant_clean: parsed.merchant_clean || payload.merchant_clean,
        category: allowed.has(parsed.category) ? parsed.category : 'other',
        subcategory: parsed.subcategory || 'other',
        plain_label: parsed.plain_label || payload.plain_label
      };
    } catch {
      // use fallback payload
    }
  }

  await pool.query(
    `INSERT INTO merchant_category_cache (merchant_hash, merchant_raw, merchant_clean, category, subcategory, plain_label, confidence)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (merchant_hash) DO NOTHING`,
    [merchantHash, cleanInput, payload.merchant_clean, payload.category, payload.subcategory, payload.plain_label, 0.8]
  );

  return { ...payload, merchant_hash: merchantHash };
}

/**
 * Batch categorize up to 50 merchants.
 * @param {string[]} merchants
 */
export async function categorizeMerchants(merchants = []) {
  return Promise.all(merchants.slice(0, 50).map((m) => categorizeMerchant(m)));
}
