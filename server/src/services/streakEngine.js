import { pool } from '../db/index.js';
import { emitToUser } from './notificationService.js';

/**
 * Update user streak based on today's activity.
 * @param {string} userId
 */
export async function updateStreak(userId) {
  const row = await pool.query('SELECT * FROM user_streaks WHERE user_id = $1', [userId]);
  const streak = row.rows[0] || { current_streak: 0, longest_streak: 0, last_activity_date: null };

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = Number(streak.current_streak);
  if (streak.last_activity_date === today) return streak;
  current = streak.last_activity_date === yesterday ? current + 1 : 1;

  const longest = Math.max(current, Number(streak.longest_streak));
  await pool.query(
    `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE SET current_streak = $2, longest_streak = $3, last_activity_date = $4`,
    [userId, current, longest, today]
  );

  emitToUser(userId, 'streak_update', { current_streak: current, milestone_hit: [7, 30].includes(current) });
  return { current_streak: current, longest_streak: longest };
}
