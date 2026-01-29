import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageTournament } from '../utils/permissions';

/**
 * Create a tournament game
 * POST /api/tournaments/:tournamentId/games
 */
export const createGame = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can create games' });
    }

    const { gameType, name, settings, roundsApplied } = req.body;

    if (!gameType) {
      return res.status(400).json({ error: 'Game type is required' });
    }

    // Validate game type
    const validGameTypes = [
      'skins',
      'nassau',
      'match_play',
      'low_ball_high_ball',
      'wolf',
      'dots',
      'vegas',
    ];

    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        error: 'Invalid game type',
        validTypes: validGameTypes,
      });
    }

    const game = await prisma.tournamentGame.create({
      data: {
        tournamentId,
        gameType,
        name: name || null,
        settings: settings || null,
        roundsApplied: roundsApplied || [1],
      },
    });

    res.status(201).json(game);
  } catch (error: any) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Failed to create game', details: error.message });
  }
};

/**
 * Get all games for a tournament
 * GET /api/tournaments/:tournamentId/games
 */
export const getGames = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);

    const games = await prisma.tournamentGame.findMany({
      where: { tournamentId },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(games);
  } catch (error: any) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to fetch games', details: error.message });
  }
};

/**
 * Update a game
 * PUT /api/tournaments/:tournamentId/games/:gameId
 */
export const updateGame = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const gameId = parseInt(req.params.gameId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can update games' });
    }

    const { gameType, name, settings, roundsApplied } = req.body;

    // Verify game belongs to tournament
    const existingGame = await prisma.tournamentGame.findUnique({
      where: { id: gameId },
    });

    if (!existingGame || existingGame.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Game not found in this tournament' });
    }

    const game = await prisma.tournamentGame.update({
      where: { id: gameId },
      data: {
        ...(gameType && { gameType }),
        ...(name !== undefined && { name }),
        ...(settings !== undefined && { settings }),
        ...(roundsApplied && { roundsApplied }),
      },
    });

    res.json(game);
  } catch (error: any) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game', details: error.message });
  }
};

/**
 * Delete a game
 * DELETE /api/tournaments/:tournamentId/games/:gameId
 */
export const deleteGame = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const gameId = parseInt(req.params.gameId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can delete games' });
    }

    // Verify game belongs to tournament
    const game = await prisma.tournamentGame.findUnique({
      where: { id: gameId },
    });

    if (!game || game.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Game not found in this tournament' });
    }

    await prisma.tournamentGame.delete({
      where: { id: gameId },
    });

    res.json({ success: true, message: 'Game deleted successfully' });
  } catch (error: any) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to delete game', details: error.message });
  }
};

/**
 * Get game results (calculated from scores)
 * GET /api/tournaments/:tournamentId/games/:gameId/results
 */
export const getGameResults = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const gameId = parseInt(req.params.gameId);

    // Get game details
    const game = await prisma.tournamentGame.findUnique({
      where: { id: gameId },
    });

    if (!game || game.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Game not found in this tournament' });
    }

    // Get all scores for this tournament
    const scores = await prisma.tournamentScore.findMany({
      where: {
        participant: {
          tournamentId,
        },
      },
      include: {
        participant: {
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
        },
        holeScores: {
          orderBy: {
            holeNumber: 'asc',
          },
        },
      },
    });

    // Calculate results based on game type
    let results: any = {};

    if (game.gameType === 'skins') {
      results = calculateSkinsResults(scores, game.settings as any);
    } else if (game.gameType === 'nassau') {
      results = calculateNassauResults(scores, game.settings as any);
    } else {
      results = {
        message: 'Result calculation not yet implemented for this game type',
        gameType: game.gameType,
      };
    }

    res.json({
      game,
      results,
    });
  } catch (error: any) {
    console.error('Get game results error:', error);
    res.status(500).json({ error: 'Failed to get game results', details: error.message });
  }
};

/**
 * Calculate skins game results
 */
function calculateSkinsResults(scores: any[], settings: any) {
  const useNetScores = settings?.useNetScores !== false;
  const requireParOrBetter = settings?.requireParOrBetter === true;
  const carryover = settings?.carryover !== false;

  const skins: Record<number, any> = {};
  let carryoverAmount = 0;

  // Group scores by hole
  const holeData: Record<number, any[]> = {};

  scores.forEach((score) => {
    score.holeScores.forEach((holeScore: any) => {
      if (!holeData[holeScore.holeNumber]) {
        holeData[holeScore.holeNumber] = [];
      }
      holeData[holeScore.holeNumber].push({
        userId: score.participant.userId,
        userName: `${score.participant.user.firstName} ${score.participant.user.lastName}`,
        grossScore: holeScore.grossScore,
        netScore: holeScore.netScore,
        par: holeScore.par,
      });
    });
  });

  // Calculate winner for each hole
  Object.keys(holeData).forEach((holeNumberStr) => {
    const holeNumber = parseInt(holeNumberStr);
    const holePlayers = holeData[holeNumber];

    if (holePlayers.length < 2) return;

    const scoreToUse = useNetScores ? 'netScore' : 'grossScore';
    const lowestScore = Math.min(...holePlayers.map((p) => p[scoreToUse]));

    // Filter winners (could be multiple if tied)
    let winners = holePlayers.filter((p) => p[scoreToUse] === lowestScore);

    // Check par-or-better requirement
    if (requireParOrBetter) {
      winners = winners.filter((p) => p[scoreToUse] <= p.par);
    }

    if (winners.length === 1) {
      // Single winner
      skins[holeNumber] = {
        winner: winners[0],
        score: lowestScore,
        amount: 1 + carryoverAmount,
      };
      carryoverAmount = 0;
    } else if (carryover) {
      // Tie with carryover
      carryoverAmount += 1;
      skins[holeNumber] = {
        tied: true,
        players: winners,
        carryoverTo: holeNumber + 1,
      };
    }
  });

  return {
    skins,
    totalSkins: Object.values(skins).filter((s) => !s.tied).length,
    carryoverRemaining: carryoverAmount,
  };
}

/**
 * Calculate Nassau game results
 */
function calculateNassauResults(_scores: any[], _settings: any) {
  // This is a simplified calculation - real Nassau requires hole-by-hole match play
  // For now, just return structure

  return {
    front9: { message: 'Front 9 results - detailed calculation pending' },
    back9: { message: 'Back 9 results - detailed calculation pending' },
    overall: { message: 'Overall 18 results - detailed calculation pending' },
    note: 'Nassau calculation requires hole-by-hole match play logic',
  };
}
