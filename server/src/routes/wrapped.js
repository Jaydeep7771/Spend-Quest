import { Router } from 'express';
import { getOrGenerateWrapped } from '../controllers/wrappedController.js';

const router = Router();
router.get('/:year/:month', getOrGenerateWrapped);

export default router;
