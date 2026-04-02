import { Router } from 'express';
import {
  categories,
  createTransaction,
  csvUpload,
  deleteTransaction,
  importCSV,
  importSMS,
  listTransactions,
  reviewTransaction,
  summary,
  updateTransaction
} from '../controllers/transactionController.js';

const router = Router();
router.get('/', listTransactions);
router.post('/', createTransaction);
router.post('/sms-import', importSMS);
router.post('/csv-import', csvUpload.single('file'), importCSV);
router.get('/summary', summary);
router.get('/categories', categories);
router.post('/:id/review', reviewTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
