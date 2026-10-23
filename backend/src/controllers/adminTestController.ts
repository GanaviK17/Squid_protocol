import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { sseService } from '../services/sseService.js';
import { logAdminAction } from '../services/auditService.js';
import { RoundStatus, SignalState } from '@prisma/client';

let isResetInProgress = false;

/**
 * RESTART GAME (TESTING) - Admin-Only Game State Reset
 * Strictly intended for local development and integration testing.
 * Protected by NODE_ENV !== 'production' AND ENABLE_TEST_GAME_RESET === 'true'.
 */
export async function restartGameTesting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Guardrail: Must NOT be production
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({
        success: false,
        error: 'PRODUCTION_PROTECTED',
        message: 'CRITICAL SAFETY GUARD: Game restart endpoint is strictly prohibited in production environment.'
      });
      return;
    }

    // 2. Guardrail: Explicit ENABLE_TEST_GAME_RESET flag
    const isFlagEnabled = process.env.ENABLE_TEST_GAME_RESET === 'true' || process.env.ENABLE_TEST_GAME_RESET === '1';
    if (!isFlagEnabled) {
      res.status(403).json({
        success: false,
        error: 'TEST_RESET_DISABLED',
        message: 'ENABLE_TEST_GAME_RESET environment flag is not enabled. Set ENABLE_TEST_GAME_RESET=true in local .env to enable.'
      });
      return;
    }

    // 3. Concurrency guard to prevent race conditions on rapid double-clicks
    if (isResetInProgress) {
      res.status(429).json({
        success: false,
        error: 'RESET_IN_PROGRESS',
        message: 'A game reset operation is currently executing. Please wait.'
      });
      return;
    }

    isResetInProgress = true;

    try {
      // 4. Transactional game state wipe & restoration
      await prisma.$transaction(async (tx) => {
        // Clear all gameplay submissions across all rounds
        await tx.submission.deleteMany({});

        // Clear all score ledger events
        await tx.scoreEvent.deleteMany({});

        // Clear any physical verification data
        await tx.physicalVerification.deleteMany({});

        // Reset all teams back to starting state (scores = 0, progression = round 1 / stage 1)
        await tx.team.updateMany({
          data: {
            totalScore: 0,
            currentRound: 1,
            currentStage: 1,
            isDisqualified: false,
            finalBreachCompletedAt: null
          }
        });

        // Safely reset Round 3 QR Access Tokens (unredeemed, clear redemption timestamps)
        await tx.accessToken.updateMany({
          data: {
            isRedeemed: false,
            redeemedAt: null
          }
        });

        // Reset all 3 rounds to UPCOMING, clear all running and paused timer state
        await tx.roundControl.updateMany({
          where: { id: { in: [1, 2, 3] } },
          data: {
            status: RoundStatus.UPCOMING,
            startTime: null,
            endTime: null,
            pausedAt: null,
            remainingSeconds: null
          }
        });

        // Restore initial Round 1 configuration: Green Light, Double Points OFF
        await tx.roundControl.update({
          where: { id: 1 },
          data: {
            signalState: SignalState.GREEN,
            doublePointsEnabled: false,
            redLightPenaltyMode: false,
            durationMinutes: 15
          }
        });

        await tx.roundControl.update({
          where: { id: 2 },
          data: {
            durationMinutes: 20
          }
        });

        await tx.roundControl.update({
          where: { id: 3 },
          data: {
            durationMinutes: 30
          }
        });
      });

      // 5. Audit Logging
      await logAdminAction({
        adminUserId: req.user!.userId,
        adminUsername: req.user!.username,
        action: "RESTART_GAME_TESTING",
        targetType: "GAME_STATE",
        details: {
          nodeEnv: process.env.NODE_ENV,
          resetTimestamp: new Date().toISOString()
        },
        ipAddress: req.ip
      });

      // 6. Broadcast real-time notifications to all connected participant consoles
      sseService.broadcast('game_reset', {
        timestamp: new Date().toISOString(),
        message: 'Game has been restarted by tournament administrator.'
      });

      sseService.broadcast('round_state_change', {
        roundId: 1,
        status: 'UPCOMING',
        timestamp: new Date().toISOString()
      });

      sseService.broadcast('signal_change', {
        roundId: 1,
        signalState: 'GREEN',
        doublePointsEnabled: false,
        redLightPenaltyMode: false,
        timestamp: new Date().toISOString()
      });

      sseService.broadcast('score_update', {
        teamId: 'ALL',
        pointsDelta: 0,
        newTotalScore: 0,
        source: 'RESTART_GAME_TESTING'
      });

      res.json({
        success: true,
        message: 'Game successfully restarted to initial waiting state. All scores and rounds reset.'
      });
    } finally {
      isResetInProgress = false;
    }
  } catch (err) {
    next(err);
  }
}
