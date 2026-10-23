import { prisma } from '../prisma.js';
import { scoringService } from './scoringService.js';
import { sseService } from './sseService.js';
import { computeRoundTimer } from './round1Service.js';
import { RoundStatus, SubmissionStatus } from '@prisma/client';

export class Round3Service {
  /**
   * Get team-specific Round 3 data.
   * Debugging challenge is hidden until the team has successfully redeemed a valid QR code.
   */
  public async getRound3Data(teamId: string) {
    const roundControl = await prisma.roundControl.findUnique({ where: { id: 3 } });
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const timer = computeRoundTimer(roundControl);

    const isRoundActive = roundControl?.status === RoundStatus.ACTIVE || roundControl?.status === RoundStatus.PAUSED;
    const isRoundUnlocked = isRoundActive || roundControl?.status === RoundStatus.ENDED;

    if (!isRoundUnlocked) {
      return {
        round: roundControl,
        timer,
        serverTime: new Date().toISOString(),
        isUnlocked: false,
        isQrRedeemed: false,
        isCompleted: false,
        message: 'Round 3 — The Final Breach is currently locked. Waiting for admin to start.',
        challenge: null
      };
    }

    // Check if team has redeemed a valid QR code
    const redeemedToken = await prisma.accessToken.findFirst({
      where: { teamId, isRedeemed: true }
    });
    const isQrRedeemed = !!redeemedToken;

    const isCompleted = !!team?.finalBreachCompletedAt;

    let debugChallenge: any = null;
    // Strictly hide debugging challenge until QR code has been redeemed
    if (isQrRedeemed || isCompleted) {
      debugChallenge = await prisma.debugChallenge.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          description: true,
          intendedBehavior: true,
          javaCode: true,
          pythonCode: true,
          cCode: true,
          inputData: true,
          derivationRule: true,
          points: true
          // expectedFinalKey omitted for security!
        }
      });
    }

    return {
      round: roundControl,
      timer,
      serverTime: new Date().toISOString(),
      isUnlocked: true,
      isQrRedeemed,
      isCompleted,
      completedAt: team?.finalBreachCompletedAt?.toISOString() || null,
      challenge: debugChallenge
    };
  }

  /**
   * Redeem a single-use QR access code obtained from the physical QR activity.
   */
  public async redeemQRCode(params: {
    teamId: string;
    code: string;
    clientIp?: string;
  }) {
    const roundControl = await prisma.roundControl.findUnique({ where: { id: 3 } });
    if (!roundControl) {
      return { success: false, error: 'ROUND_NOT_FOUND', message: 'Round 3 control not found.' };
    }

    if (roundControl.status === RoundStatus.PAUSED) {
      return {
        success: false,
        error: 'ROUND_PAUSED',
        message: 'Round 3 is currently paused by tournament officials.'
      };
    }

    if (roundControl.status !== RoundStatus.ACTIVE) {
      return {
        success: false,
        error: 'ROUND_INACTIVE',
        message: 'Round 3 is not currently active.'
      };
    }

    if (roundControl.endTime && new Date() > new Date(roundControl.endTime)) {
      return {
        success: false,
        error: 'ROUND_EXPIRED',
        message: 'Round 3 submission deadline has passed.'
      };
    }

    // Check if team already redeemed a token
    const alreadyRedeemed = await prisma.accessToken.findFirst({
      where: { teamId: params.teamId, isRedeemed: true }
    });
    if (alreadyRedeemed) {
      return {
        success: true,
        alreadyRedeemed: true,
        isQrRedeemed: true,
        message: 'QR Access Code has already been successfully redeemed for your team. Challenge unlocked!'
      };
    }

    // Normalize code: strip URL prefix if scanned as SQUID://ACCESS/CODE
    let rawCode = params.code.trim();
    if (rawCode.toUpperCase().startsWith('SQUID://ACCESS/')) {
      rawCode = rawCode.substring(15);
    }
    const normalizedCode = rawCode.trim().toUpperCase();

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        // Find token by exact code
        const token = await tx.accessToken.findFirst({
          where: { tokenCode: { equals: normalizedCode, mode: 'insensitive' } }
        });

        if (!token) {
          return {
            success: false,
            error: 'INVALID_QR_CODE',
            message: 'Invalid QR redemption code. Please check your reconstructed code.'
          };
        }

        if (token.isRedeemed) {
          return {
            success: false,
            error: 'CODE_ALREADY_USED',
            message: 'This QR code has already been redeemed.'
          };
        }

        // If pre-assigned to another team
        if (token.teamId && token.teamId !== params.teamId) {
          return {
            success: false,
            error: 'CODE_ASSIGNED_TO_OTHER',
            message: 'This QR code is designated for a different team.'
          };
        }

        // Mark redeemed atomically
        await tx.accessToken.update({
          where: { id: token.id },
          data: {
            teamId: params.teamId,
            isRedeemed: true,
            redeemedAt: new Date()
          }
        });

        // Record submission for audit
        await tx.submission.create({
          data: {
            teamId: params.teamId,
            round: 3,
            stage: 2,
            submittedValue: normalizedCode,
            status: SubmissionStatus.CORRECT,
            pointsAwarded: 0,
            clientIp: params.clientIp
          }
        });

        return {
          success: true,
          isQrRedeemed: true,
          message: 'QR Code verified! The Final Debugging Challenge has been unlocked.'
        };
      });

      return txResult;
    } catch (err: any) {
      if (err.code === 'P2002') {
        return {
          success: false,
          error: 'CONCURRENT_REDEMPTION',
          message: 'This QR code was redeemed in a concurrent transaction.'
        };
      }
      throw err;
    }
  }

  /**
   * Submit and validate the final debugging challenge key.
   * Awards +200 points exactly once upon correct derivation.
   */
  public async submitFinalKey(params: {
    teamId: string;
    finalKey: string;
    clientIp?: string;
  }) {
    // 1. Verify Round 3 is active
    const roundControl = await prisma.roundControl.findUnique({ where: { id: 3 } });
    if (!roundControl) {
      return { success: false, error: 'ROUND_NOT_FOUND', message: 'Round 3 control not found.' };
    }

    if (roundControl.status === RoundStatus.PAUSED) {
      return {
        success: false,
        error: 'ROUND_PAUSED',
        message: 'Round 3 is currently paused by tournament officials.'
      };
    }

    if (roundControl.status !== RoundStatus.ACTIVE) {
      return {
        success: false,
        error: 'ROUND_INACTIVE',
        message: 'Round 3 — The Final Breach is not currently active.'
      };
    }

    // 2. Authoritative deadline check
    if (roundControl.endTime && new Date() > new Date(roundControl.endTime)) {
      return {
        success: false,
        error: 'ROUND_EXPIRED',
        message: 'Round 3 submission deadline has passed.'
      };
    }

    // 3. Verify team has redeemed QR code first!
    const redeemedToken = await prisma.accessToken.findFirst({
      where: { teamId: params.teamId, isRedeemed: true }
    });
    if (!redeemedToken) {
      return {
        success: false,
        error: 'QR_NOT_REDEEMED',
        message: 'Access Denied. You must redeem your physical QR code before submitting the debugging challenge.'
      };
    }

    // 4. Team check & idempotency check
    const team = await prisma.team.findUnique({ where: { id: params.teamId } });
    if (!team) {
      return { success: false, error: 'TEAM_NOT_FOUND', message: 'Team does not exist.' };
    }

    if (team.finalBreachCompletedAt) {
      return {
        success: true,
        alreadyCompleted: true,
        isCorrect: true,
        pointsAwarded: 0,
        completedAt: team.finalBreachCompletedAt.toISOString(),
        message: 'Final Breach has already been solved and registered for your team.',
        newTotalScore: team.totalScore
      };
    }

    // 5. Fetch active debug challenge
    const challenge = await prisma.debugChallenge.findFirst({
      where: { isActive: true }
    });

    if (!challenge) {
      return { success: false, error: 'NO_CHALLENGE', message: 'No active Debug Challenge configured.' };
    }

    const normalizedKey = params.finalKey.trim().toUpperCase();
    const isCorrect = normalizedKey === challenge.expectedFinalKey.toUpperCase();

    if (!isCorrect) {
      await prisma.submission.create({
        data: {
          teamId: params.teamId,
          round: 3,
          stage: 3,
          submittedValue: normalizedKey,
          status: SubmissionStatus.INCORRECT,
          pointsAwarded: 0,
          clientIp: params.clientIp
        }
      });

      return {
        success: false,
        isCorrect: false,
        error: 'INVALID_FINAL_KEY',
        message: 'Breach Key Rejected. Verify the corrected program output across your chosen language.'
      };
    }

    const completionTimestamp = new Date();
    const source = 'ROUND3_FINAL_KEY';

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        const existingScore = await tx.scoreEvent.findUnique({
          where: {
            teamId_source: {
              teamId: params.teamId,
              source
            }
          }
        });

        if (existingScore) {
          const currentTeam = await tx.team.findUnique({ where: { id: params.teamId } });
          return {
            alreadyCompleted: true,
            isCorrect: true,
            pointsAwarded: 0,
            completedAt: currentTeam?.finalBreachCompletedAt?.toISOString() || completionTimestamp.toISOString(),
            message: 'Final Breach already scored for your team.',
            newTotalScore: currentTeam?.totalScore ?? 0
          };
        }

        await tx.submission.create({
          data: {
            teamId: params.teamId,
            round: 3,
            stage: 3,
            submittedValue: normalizedKey,
            status: SubmissionStatus.CORRECT,
            pointsAwarded: challenge.points,
            clientIp: params.clientIp
          }
        });

        await tx.scoreEvent.create({
          data: {
            teamId: params.teamId,
            round: 3,
            stage: 3,
            source,
            pointsDelta: challenge.points,
            reason: 'Final Breach Debugging Challenge solved (+200)'
          }
        });

        const updatedTeam = await tx.team.update({
          where: { id: params.teamId },
          data: {
            finalBreachCompletedAt: completionTimestamp,
            totalScore: {
              increment: challenge.points
            }
          }
        });

        return {
          alreadyCompleted: false,
          isCorrect: true,
          pointsAwarded: challenge.points,
          completedAt: completionTimestamp.toISOString(),
          message: `SYSTEM BREACH SUCCESSFUL! Correct Key Verified. +${challenge.points} points awarded.`,
          newTotalScore: updatedTeam.totalScore
        };
      });

      if (!txResult.alreadyCompleted) {
        sseService.broadcast('final_breach', {
          teamId: params.teamId,
          teamName: team.name,
          completedAt: completionTimestamp.toISOString(),
          points: challenge.points
        });

        sseService.broadcast('score_update', {
          teamId: params.teamId,
          pointsDelta: challenge.points,
          newTotalScore: txResult.newTotalScore,
          source
        });
      }

      return {
        success: true,
        ...txResult
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        const currentTeam = await prisma.team.findUnique({ where: { id: params.teamId } });
        return {
          success: true,
          alreadyCompleted: true,
          isCorrect: true,
          pointsAwarded: 0,
          completedAt: currentTeam?.finalBreachCompletedAt?.toISOString() || completionTimestamp.toISOString(),
          message: 'Final Breach already scored for your team.',
          newTotalScore: currentTeam?.totalScore ?? 0
        };
      }
      throw err;
    }
  }
}

export const round3Service = new Round3Service();
