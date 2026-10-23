import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Strictly ADMIN-ONLY: participants and public cannot view leaderboard
router.get('/', authenticate, requireRole(UserRole.ADMIN), getLeaderboard);

export default router;
