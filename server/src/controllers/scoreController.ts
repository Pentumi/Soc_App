import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { adjustHandicapsForTournament } from '../services/handicapService';

// Calculate Stableford points for a hole
function calculateStablefordPoints(strokes: number, par: number, handicapStrokes: number): number {
  const netStrokes = strokes - handicapStrokes;
  const scoreToPar = netStrokes - par;

  // Stableford point system
  if (scoreToPar <= -3) return 5; // Double eagle or better
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  return 0; // Double bogey or worse
}

// Calculate handicap strokes for a hole based on playing handicap and stroke index
function getHandicapStrokes(playingHandicap: number, strokeIndex: number): number {
  const fullHandicap = Math.floor(playingHandicap);
  const extraStrokes = playingHandicap - fullHandicap;

  // Base strokes (every hole gets this if handicap >= 18)
  let strokes = Math.floor(fullHandicap / 18);

  // Additional stroke if stroke index <= handicap mod 18
  if (strokeIndex <= (fullHandicap % 18)) {
    strokes += 1;
  }

  // Fractional handicap consideration (for stroke index 1-9)
  if (extraStrokes > 0 && strokeIndex <= Math.ceil(extraStrokes * 18)) {
    strokes += 0; // In Stableford we typically don't give fractional strokes
  }

  return strokes;
}

export const submitTournamentScore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tournamentId, userId, grossScore, holeScores } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        course: {
          include: {
            holes: {
              orderBy: { holeNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    let finalGrossScore: number;

    // If hole scores are provided, validate and calculate gross score
    if (holeScores && Array.isArray(holeScores)) {
      const courseHoles = tournament.course.holes;

      // Validate hole count
      if (holeScores.length !== courseHoles.length) {
        throw new AppError(
          `Invalid hole count. Expected ${courseHoles.length} holes, received ${holeScores.length}`,
          400
        );
      }

      // Create a map of valid hole IDs
      const validHoleIds = new Set(courseHoles.map((h) => h.id));

      // Validate each hole score
      for (const holeScore of holeScores) {
        if (!validHoleIds.has(parseInt(holeScore.holeId))) {
          throw new AppError(`Invalid hole ID: ${holeScore.holeId}`, 400);
        }

        const strokes = parseInt(holeScore.strokes);
        if (isNaN(strokes) || strokes < 1 || strokes > 15) {
          throw new AppError(`Invalid strokes for hole ${holeScore.holeId}: must be between 1 and 15`, 400);
        }
      }

      // Calculate gross score from hole scores
      finalGrossScore = holeScores.reduce((sum, hs) => sum + parseInt(hs.strokes), 0);
    } else if (grossScore !== undefined) {
      // Backward compatibility: use provided gross score
      finalGrossScore = parseInt(grossScore);
    } else {
      throw new AppError('Either grossScore or holeScores must be provided', 400);
    }

    const handicap = user.currentHandicap || 0;
    const netScore = Math.round(finalGrossScore - parseFloat(handicap.toString()));

    // Calculate Stableford points if format is Stableford and hole scores provided
    let stablefordPoints: number | null = null;
    if (tournament.format === 'Stableford' && holeScores && Array.isArray(holeScores)) {
      stablefordPoints = 0;
      const courseHoles = tournament.course.holes;

      for (const hs of holeScores) {
        const hole = courseHoles.find((h) => h.id === parseInt(hs.holeId));
        if (hole && hole.strokeIndex) {
          const handicapStrokes = getHandicapStrokes(parseFloat(handicap.toString()), hole.strokeIndex);
          const points = calculateStablefordPoints(parseInt(hs.strokes), hole.par, handicapStrokes);
          stablefordPoints += points;
        }
      }
    }

    const existingScore = await prisma.tournamentScore.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: parseInt(tournamentId),
          userId: parseInt(userId),
        },
      },
    });

    let score: any;

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      if (existingScore) {
        // Update existing score
        score = await tx.tournamentScore.update({
          where: {
            tournamentId_userId: {
              tournamentId: parseInt(tournamentId),
              userId: parseInt(userId),
            },
          },
          data: {
            grossScore: finalGrossScore,
            handicapAtTime: handicap,
            netScore,
            stablefordPoints,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            tournament: true,
          },
        });

        // Delete old hole scores if they exist
        if (holeScores) {
          await tx.holeScore.deleteMany({
            where: { tournamentScoreId: existingScore.id },
          });
        }
      } else {
        // Ensure participant exists before creating score
        let participant = await tx.tournamentParticipant.findUnique({
          where: {
            tournamentId_userId: {
              tournamentId: parseInt(tournamentId),
              userId: parseInt(userId),
            },
          },
        });

        if (!participant) {
          // Auto-create participant if they don't exist
          participant = await tx.tournamentParticipant.create({
            data: {
              tournamentId: parseInt(tournamentId),
              userId: parseInt(userId),
              role: 'player',
              status: 'registered',
            },
          });
        }

        // Create new score
        score = await tx.tournamentScore.create({
          data: {
            tournamentId: parseInt(tournamentId),
            participantId: participant.id,
            userId: parseInt(userId),
            grossScore: finalGrossScore,
            handicapAtTime: handicap,
            netScore,
            stablefordPoints,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            tournament: true,
          },
        });
      }

      // Create new hole scores if provided
      if (holeScores && score) {
        const courseHoles = tournament.course.holes;
        const holeScoreData = holeScores.map((hs: any) => {
          let points: number | null = null;

          // Calculate Stableford points for this hole if format is Stableford
          if (tournament.format === 'Stableford') {
            const hole = courseHoles.find((h) => h.id === parseInt(hs.holeId));
            if (hole && hole.strokeIndex) {
              const handicapStrokes = getHandicapStrokes(parseFloat(handicap.toString()), hole.strokeIndex);
              points = calculateStablefordPoints(parseInt(hs.strokes), hole.par, handicapStrokes);
            }
          }

          return {
            tournamentScoreId: score.id,
            holeId: parseInt(hs.holeId),
            strokes: parseInt(hs.strokes),
            stablefordPoints: points,
            putts: hs.putts ? parseInt(hs.putts) : null,
            fairwayHit: hs.fairwayHit !== undefined ? Boolean(hs.fairwayHit) : null,
            greenInRegulation: hs.greenInRegulation !== undefined ? Boolean(hs.greenInRegulation) : null,
          };
        });

        await tx.holeScore.createMany({
          data: holeScoreData,
        });
      }
    });

    res.status(existingScore ? 200 : 201).json(score);
  } catch (error) {
    next(error);
  }
};

export const getTournamentLeaderboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      select: { format: true },
    });

    const scores = await prisma.tournamentScore.findMany({
      where: {
        tournamentId: parseInt(tournamentId),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            currentHandicap: true,
          },
        },
      },
      orderBy:
        tournament?.format === 'Stableford'
          ? { stablefordPoints: 'desc' } // Highest points wins in Stableford
          : { netScore: 'asc' }, // Lowest score wins in Stroke Play
    });

    res.json(scores);
  } catch (error) {
    next(error);
  }
};

export const completeTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        tournamentScores: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    if (tournament.status === 'completed') {
      throw new AppError('Tournament already completed', 400);
    }

    if (!tournament.isMajor) {
      await prisma.tournament.update({
        where: { id: parseInt(tournamentId) },
        data: { status: 'completed' },
      });

      res.json({ message: 'Tournament completed (no handicap adjustments for non-major)' });
      return;
    }

    await adjustHandicapsForTournament(parseInt(tournamentId));

    await prisma.tournament.update({
      where: { id: parseInt(tournamentId) },
      data: { status: 'completed' },
    });

    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        tournamentScores: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                currentHandicap: true,
              },
            },
          },
          orderBy: {
            netScore: 'asc',
          },
        },
      },
    });

    res.json(updatedTournament);
  } catch (error) {
    next(error);
  }
};

export const deleteScore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.tournamentScore.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getHoleScores = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const scoreId = req.params.scoreId as string;

    const holeScores = await prisma.holeScore.findMany({
      where: { tournamentScoreId: parseInt(scoreId) },
      include: {
        hole: {
          select: {
            id: true,
            holeNumber: true,
            par: true,
            strokeIndex: true,
            yardage: true,
          },
        },
      },
      orderBy: {
        hole: {
          holeNumber: 'asc',
        },
      },
    });

    res.json(holeScores);
  } catch (error) {
    next(error);
  }
};
