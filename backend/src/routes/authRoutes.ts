import { Router } from 'express';
import { teamLogin, adminLogin, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/team/login', authRateLimiter, teamLogin);
router.post('/admin/login', authRateLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
