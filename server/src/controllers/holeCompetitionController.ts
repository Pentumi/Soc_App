import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageTournament } from '../utils/permissions';

/**
 * Create a hole competition
 * POST /api/tournaments/:tournamentId/hole-competitions
 */
export const createHoleCompetition = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can create hole competitions' });
    }

    const { holeNumber, competitionType, prizeDescription } = req.body;

    if (!holeNumber || !competitionType) {
      return res.status(400).json({ error: 'Hole number and competition type are required' });
    }

    // Validate competition type
    const validTypes = [
      'closest_to_pin',
      'longest_drive',
      'straightest_drive',
      'closest_in_two',
    ];

    if (!validTypes.includes(competitionType)) {
      return res.status(400).json({
        error: 'Invalid competition type',
        validTypes,
      });
    }

    // Validate hole number
    if (holeNumber < 1 || holeNumber > 18) {
      return res.status(400).json({ error: 'Hole number must be between 1 and 18' });
    }

    const competition = await prisma.holeCompetition.create({
      data: {
        tournamentId,
        holeNumber,
        competitionType,
        prizeDescription: prizeDescription || null,
      },
    });

    res.status(201).json(competition);
  } catch (error: any) {
    console.error('Create hole competition error:', error);
    res.status(500).json({ error: 'Failed to create hole competition', details: error.message });
  }
};

/**
 * Get all hole competitions for a tournament
 * GET /api/tournaments/:tournamentId/hole-competitions
 */
export const getHoleCompetitions = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);

    const competitions = await prisma.holeCompetition.findMany({
      where: { tournamentId },
      include: {
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        holeNumber: 'asc',
      },
    });

    res.json(competitions);
  } catch (error: any) {
    console.error('Get hole competitions error:', error);
    res.status(500).json({ error: 'Failed to fetch hole competitions', details: error.message });
  }
};

/**
 * Update a hole competition
 * PUT /api/tournaments/:tournamentId/hole-competitions/:competitionId
 */
export const updateHoleCompetition = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const competitionId = parseInt(req.params.competitionId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can update hole competitions' });
    }

    const { holeNumber, competitionType, prizeDescription } = req.body;

    // Verify competition belongs to tournament
    const existing = await prisma.holeCompetition.findUnique({
      where: { id: competitionId },
    });

    if (!existing || existing.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Hole competition not found in this tournament' });
    }

    const competition = await prisma.holeCompetition.update({
      where: { id: competitionId },
      data: {
        ...(holeNumber && { holeNumber }),
        ...(competitionType && { competitionType }),
        ...(prizeDescription !== undefined && { prizeDescription }),
      },
      include: {
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.json(competition);
  } catch (error: any) {
    console.error('Update hole competition error:', error);
    res.status(500).json({ error: 'Failed to update hole competition', details: error.message });
  }
};

/**
 * Delete a hole competition
 * DELETE /api/tournaments/:tournamentId/hole-competitions/:competitionId
 */
export const deleteHoleCompetition = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const competitionId = parseInt(req.params.competitionId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can delete hole competitions' });
    }

    // Verify competition belongs to tournament
    const competition = await prisma.holeCompetition.findUnique({
      where: { id: competitionId },
    });

    if (!competition || competition.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Hole competition not found in this tournament' });
    }

    await prisma.holeCompetition.delete({
      where: { id: competitionId },
    });

    res.json({ success: true, message: 'Hole competition deleted successfully' });
  } catch (error: any) {
    console.error('Delete hole competition error:', error);
    res.status(500).json({ error: 'Failed to delete hole competition', details: error.message });
  }
};

/**
 * Set winner for a hole competition
 * POST /api/tournaments/:tournamentId/hole-competitions/:competitionId/winner
 */
export const setWinner = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const competitionId = parseInt(req.params.competitionId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can set competition winners' });
    }

    const { winnerId, winningDistance } = req.body;

    if (!winnerId) {
      return res.status(400).json({ error: 'Winner ID is required' });
    }

    // Verify competition belongs to tournament
    const competition = await prisma.holeCompetition.findUnique({
      where: { id: competitionId },
    });

    if (!competition || competition.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Hole competition not found in this tournament' });
    }

    // Verify winner is a tournament participant
    const participant = await prisma.tournamentParticipant.findFirst({
      where: {
        tournamentId,
        userId: winnerId,
      },
    });

    if (!participant) {
      return res.status(400).json({ error: 'Winner must be a tournament participant' });
    }

    // Update competition with winner
    const updatedCompetition = await prisma.holeCompetition.update({
      where: { id: competitionId },
      data: {
        winnerId,
        winningDistance: winningDistance ? parseFloat(winningDistance) : null,
      },
      include: {
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.json(updatedCompetition);
  } catch (error: any) {
    console.error('Set winner error:', error);
    res.status(500).json({ error: 'Failed to set winner', details: error.message });
  }
};

/**
 * Remove winner from a hole competition
 * DELETE /api/tournaments/:tournamentId/hole-competitions/:competitionId/winner
 */
export const removeWinner = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const competitionId = parseInt(req.params.competitionId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can remove competition winners' });
    }

    // Verify competition belongs to tournament
    const competition = await prisma.holeCompetition.findUnique({
      where: { id: competitionId },
    });

    if (!competition || competition.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Hole competition not found in this tournament' });
    }

    // Remove winner
    const updatedCompetition = await prisma.holeCompetition.update({
      where: { id: competitionId },
      data: {
        winnerId: null,
        winningDistance: null,
      },
    });

    res.json(updatedCompetition);
  } catch (error: any) {
    console.error('Remove winner error:', error);
    res.status(500).json({ error: 'Failed to remove winner', details: error.message });
  }
};
