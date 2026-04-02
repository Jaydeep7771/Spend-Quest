import cron from 'node-cron';

export function startQuestEvalJob(task) {
  cron.schedule('0 * * * *', task);
}
