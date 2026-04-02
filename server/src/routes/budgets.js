import { Router } from 'express';
import { budgetStatus, createBudget, deleteBudget, listBudgets, updateBudget } from '../controllers/budgetController.js';

const router = Router();
router.get('/', listBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.get('/status', budgetStatus);

export default router;
