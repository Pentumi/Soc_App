import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getTournamentStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Get tournament with course holes
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: {
          include: {
            holes: true,
          },
        },
        tournamentScores: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            holeScores: {
              include: {
                hole: true,
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      res.status(404).json({ error: 'Tournament not found' });
      return;
    }

    // Calculate statistics
    const stats = {
      biggestBlowupHole: calculateBiggestBlowup(tournament),
      lowestHoleScore: calculateLowestHoleScore(tournament),
      bestGrossRound: calculateBestGrossRound(tournament),
      worstGrossRound: calculateWorstGrossRound(tournament),
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

function calculateBiggestBlowup(tournament: any) {
  let maxOverPar = 0;
  let result = null;

  tournament.tournamentScores.forEach((score: any) => {
    score.holeScores.forEach((holeScore: any) => {
      const overPar = holeScore.strokes - holeScore.hole.par;
      if (overPar > maxOverPar) {
        maxOverPar = overPar;
        result = {
          player: `${score.user.firstName} ${score.user.lastName}`,
          hole: holeScore.hole.holeNumber,
          strokes: holeScore.strokes,
          par: holeScore.hole.par,
          overPar: overPar,
        };
      }
    });
  });

  return result;
}

function calculateLowestHoleScore(tournament: any) {
  let minScore = Infinity;
  let result = null;

  tournament.tournamentScores.forEach((score: any) => {
    score.holeScores.forEach((holeScore: any) => {
      if (holeScore.strokes < minScore) {
        minScore = holeScore.strokes;
        result = {
          player: `${score.user.firstName} ${score.user.lastName}`,
          hole: holeScore.hole.holeNumber,
          strokes: holeScore.strokes,
          par: holeScore.hole.par,
        };
      }
    });
  });

  return result;
}

function calculateBestGrossRound(tournament: any) {
  let minGross = Infinity;
  let result = null;

  tournament.tournamentScores.forEach((score: any) => {
    if (score.grossScore < minGross) {
      minGross = score.grossScore;
      result = {
        player: `${score.user.firstName} ${score.user.lastName}`,
        grossScore: score.grossScore,
        coursePar: tournament.course.par,
        toPar: score.grossScore - tournament.course.par,
      };
    }
  });

  return result;
}

function calculateWorstGrossRound(tournament: any) {
  let maxGross = 0;
  let result = null;

  tournament.tournamentScores.forEach((score: any) => {
    if (score.grossScore > maxGross) {
      maxGross = score.grossScore;
      result = {
        player: `${score.user.firstName} ${score.user.lastName}`,
        grossScore: score.grossScore,
        coursePar: tournament.course.par,
        toPar: score.grossScore - tournament.course.par,
      };
    }
  });

  return result;
}
