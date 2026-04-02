import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import questRoutes from './routes/quests.js';
import gamificationRoutes from './routes/gamification.js';
import socialRoutes from './routes/social.js';
import wrappedRoutes from './routes/wrapped.js';
import { authMiddleware } from './middleware/auth.js';
import { authLimiter, generalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(generalLimiter);

  app.get('/api/health', (_, res) => res.json({ success: true, data: 'ok' }));
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/transactions', authMiddleware, transactionRoutes);
  app.use('/api/budgets', authMiddleware, budgetRoutes);
  app.use('/api/quests', authMiddleware, questRoutes);
  app.use('/api/gamification', authMiddleware, gamificationRoutes);
  app.use('/api/social', authMiddleware, socialRoutes);
  app.use('/api/wrapped', authMiddleware, wrappedRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
