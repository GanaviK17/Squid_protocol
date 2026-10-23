import { Router } from 'express';
import { getRound3, redeemQRCode, submitFinalKey } from '../controllers/round3Controller.js';
import { authenticate } from '../middleware/auth.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/data', authenticate, getRound3);
router.post('/qr/redeem', authenticate, submissionRateLimiter, redeemQRCode);
router.post('/debug/submit', authenticate, submissionRateLimiter, submitFinalKey);

export default router;
