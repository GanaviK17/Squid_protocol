import { Router } from 'express';
import { getTeamMe } from '../controllers/teamController.js';
import { authenticate, requireTeam } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireTeam, getTeamMe);

export default router;
