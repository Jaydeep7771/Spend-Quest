import { Router } from 'express';
import {
  acceptArenaChallenge,
  createArenaChallenge,
  createSquad,
  getArenaChallenge,
  getSquad,
  joinSquad,
  leaderboard
} from '../controllers/socialController.js';

const router = Router();
router.get('/leaderboard', leaderboard);
router.post('/squads', createSquad);
router.get('/squads/:id', getSquad);
router.post('/squads/join', joinSquad);
router.post('/arena/challenge', createArenaChallenge);
router.get('/arena/:id', getArenaChallenge);
router.put('/arena/:id/accept', acceptArenaChallenge);

export default router;
