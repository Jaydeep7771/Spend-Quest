import { Router } from 'express';
import { evaluateQuestById, joinQuest, listQuests } from '../controllers/questController.js';

const router = Router();
router.get('/', listQuests);
router.post('/:id/join', joinQuest);
router.post('/:id/evaluate', evaluateQuestById);

export default router;
