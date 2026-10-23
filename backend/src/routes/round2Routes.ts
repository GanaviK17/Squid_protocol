import { Router } from 'express';
import { getRound2, submitSudoku, submitBrokenLogic } from '../controllers/round2Controller.js';
import { authenticate } from '../middleware/auth.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/data', authenticate, getRound2);
router.post('/sudoku/submit', authenticate, submissionRateLimiter, submitSudoku);
router.post('/broken-logic/submit', authenticate, submissionRateLimiter, submitBrokenLogic);

export default router;
