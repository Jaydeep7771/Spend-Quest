import { Router } from 'express';
import { badges, quests, streaks, xp } from '../controllers/gamificationController.js';
import { joinQuest } from '../controllers/questController.js';

const router = Router();
router.get('/xp', xp);
router.get('/badges', badges);
router.get('/quests', quests);
router.post('/quests/:id/join', joinQuest);
router.get('/streaks', streaks);

export default router;
