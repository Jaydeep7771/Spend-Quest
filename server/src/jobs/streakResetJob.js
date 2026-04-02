import cron from 'node-cron';

export function startStreakResetJob(task) {
  cron.schedule('0 0 * * *', task);
}
