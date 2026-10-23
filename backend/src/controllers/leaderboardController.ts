import { Request, Response, NextFunction } from 'express';
import { scoringService } from '../services/scoringService.js';
import { UserRole } from '@prisma/client';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. The leaderboard is strictly restricted to tournament officials.'
      });
      return;
    }

    const leaderboard = await scoringService.getLeaderboard();

    res.json({
      success: true,
      updatedAt: new Date().toISOString(),
      teams: leaderboard
    });
  } catch (err) {
    next(err);
  }
}
