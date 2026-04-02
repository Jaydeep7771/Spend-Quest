import Queue from 'bull';

export const smsParseQueue = new Queue('sms-parse', process.env.REDIS_URL);
