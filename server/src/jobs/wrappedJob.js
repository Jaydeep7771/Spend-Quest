import cron from 'node-cron';

export function startWrappedJob(task) {
  cron.schedule('0 0 1 * *', task);
}
