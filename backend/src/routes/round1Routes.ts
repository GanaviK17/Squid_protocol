import { Router } from 'express';
import { getRound1, submitRound1 } from '../controllers/round1Controller.js';
import { authenticate } from '../middleware/auth.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/questions', authenticate, getRound1);
router.post('/submit', authenticate, submissionRateLimiter, submitRound1);

export default router;
