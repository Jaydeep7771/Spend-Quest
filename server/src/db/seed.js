import 'dotenv/config';
import { pool } from './index.js';

const badges = [
  ['first_steps', 'First Steps', 'Log your first transaction', '👣', 25],
  ['week_warrior', 'Week Warrior', 'Use SpendQuest 7 days in a row', '🗓️', 50],
  ['month_master', 'Month Master', '30-day streak', '🏆', 200],
  ['subscription_slayer', 'Subscription Slayer', 'Cancel 3 unused subscriptions', '✂️', 100],
  ['zero_week', 'Zero Week', 'No discretionary spend for 7 days', '🧊', 300],
  ['chai_not_latte', 'Chai Not Latte', 'Cut café spend by 30%', '☕', 75],
  ['budget_boss', 'Budget Boss', 'Hit all budgets in a month', '💼', 150],
  ['squad_captain', 'Squad Captain', 'Create a squad', '👑', 100],
  ['arena_champion', 'Arena Champion', 'Win 3 budget arena challenges', '⚔️', 200],
  ['category_cleaner', 'Category Cleaner', 'Categorize 100 transactions', '🧹', 50],
  ['wrapped_watcher', 'Wrapped Watcher', 'View your first SpendWrapped', '🎁', 50],
  ['saver_og', 'Saver OG', 'Reach Level 6: SpendQuest Legend', '💎', 500]
];

const quests = [
  ['street_food_budget', 'Street Food Budget', 'Keep food spending under ₹500 this week', 'spending_limit', 'easy', 75, 7, { category: 'food', limit: 500 }, 'weekly'],
  ['no_delivery_week', 'No Delivery Week', 'Zero food delivery apps for 7 days', 'no_category', 'hard', 300, 7, { subcategory: 'food_delivery', limit: 0 }, 'weekly'],
  ['transport_saver', 'Transport Saver', 'Keep rides under ₹200', 'spending_limit', 'medium', 150, 7, { category: 'transport', limit: 200 }, 'weekly'],
  ['daily_logger', 'Daily Logger', 'Review transactions every day for 7 days', 'streak', 'easy', 75, 7, { metric: 'reviews', limit: 7 }, 'weekly'],
  ['subscription_audit', 'Subscription Audit', 'Cancel at least 1 unused subscription', 'save_amount', 'medium', 150, 30, { category: 'subscription', limit: 1 }, 'monthly'],
  ['ten_percent_saver', '10% Saver', 'Spend 10% less than last month total', 'save_amount', 'hard', 300, 30, { metric: 'month_over_month', limit: 10 }, 'monthly'],
  ['category_master', 'Category Master', 'Stay under budget in all categories', 'spending_limit', 'hard', 500, 30, { metric: 'all_budgets_under', limit: 100 }, 'monthly'],
  ['zero_week_monthly', 'Zero Week', 'One full week with zero discretionary spending', 'no_category', 'hard', 300, 30, { metric: 'zero_discretionary_days', limit: 7 }, 'monthly']
];

async function seed() {
  for (const b of badges) {
    await pool.query(
      `INSERT INTO badges (id, name, description, icon, xp_reward)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      b
    );
  }

  for (const q of quests) {
    await pool.query(
      `INSERT INTO quests (id, title, description, type, difficulty, xp_reward, duration_days, condition, recurrence)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      q
    );
  }

  await pool.end();
  console.log('Seed completed');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
