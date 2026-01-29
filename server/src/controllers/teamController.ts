import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageTournament } from '../utils/permissions';

/**
 * Create a new team for a tournament
 * POST /api/tournaments/:tournamentId/teams
 */
export const createTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can create teams' });
    }

    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = await prisma.team.create({
      data: {
        tournamentId,
        name,
        color: color || null,
      },
    });

    res.status(201).json(team);
  } catch (error: any) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team', details: error.message });
  }
};

/**
 * Get all teams for a tournament
 * GET /api/tournaments/:tournamentId/teams
 */
export const getTeams = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);

    const teams = await prisma.team.findMany({
      where: { tournamentId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                currentHandicap: true,
                profilePhoto: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(teams);
  } catch (error: any) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
};

/**
 * Update a team
 * PUT /api/tournaments/:tournamentId/teams/:teamId
 */
export const updateTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const teamId = parseInt(req.params.teamId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can update teams' });
    }

    const { name, color } = req.body;

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(color !== undefined && { color }),
      },
    });

    res.json(team);
  } catch (error: any) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team', details: error.message });
  }
};

/**
 * Delete a team
 * DELETE /api/tournaments/:tournamentId/teams/:teamId
 */
export const deleteTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const teamId = parseInt(req.params.teamId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can delete teams' });
    }

    // Check if team belongs to this tournament
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Team not found in this tournament' });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team', details: error.message });
  }
};

/**
 * Assign players to a team
 * POST /api/tournaments/:tournamentId/teams/:teamId/assign
 */
export const assignPlayers = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const teamId = parseInt(req.params.teamId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can assign players to teams' });
    }

    const { playerIds } = req.body;

    if (!playerIds || !Array.isArray(playerIds)) {
      return res.status(400).json({ error: 'playerIds array is required' });
    }

    // Verify team belongs to tournament
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Team not found in this tournament' });
    }

    // Assign all players to this team
    const updates = await Promise.all(
      playerIds.map((playerId: number) =>
        prisma.tournamentParticipant.updateMany({
          where: {
            tournamentId,
            userId: playerId,
          },
          data: {
            teamId,
          },
        })
      )
    );

    const assignedCount = updates.reduce((sum, update) => sum + update.count, 0);

    res.json({
      success: true,
      message: `Assigned ${assignedCount} players to ${team.name}`,
      assignedCount,
    });
  } catch (error: any) {
    console.error('Assign players error:', error);
    res.status(500).json({ error: 'Failed to assign players', details: error.message });
  }
};

/**
 * Remove player from team
 * DELETE /api/tournaments/:tournamentId/teams/:teamId/players/:playerId
 */
export const removePlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const teamId = parseInt(req.params.teamId);
    const playerId = parseInt(req.params.playerId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can remove players from teams' });
    }

    // Remove player from team (set teamId to null)
    await prisma.tournamentParticipant.updateMany({
      where: {
        tournamentId,
        userId: playerId,
        teamId,
      },
      data: {
        teamId: null,
      },
    });

    res.json({ success: true, message: 'Player removed from team' });
  } catch (error: any) {
    console.error('Remove player error:', error);
    res.status(500).json({ error: 'Failed to remove player', details: error.message });
  }
};

/**
 * Get team leaderboard/stats
 * GET /api/tournaments/:tournamentId/teams/:teamId/stats
 */
export const getTeamStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const teamId = parseInt(req.params.teamId);

    // Get all participants in this team with their scores
    const participants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentHandicap: true,
            profilePhoto: true,
          },
        },
        scores: true,
      },
    });

    // Calculate team stats
    const totalPlayers = participants.length;
    const playersWithScores = participants.filter((p) => p.scores.length > 0).length;
    const totalGross = participants.reduce(
      (sum, p) => sum + (p.scores[0]?.grossScore || 0),
      0
    );
    const totalNet = participants.reduce(
      (sum, p) => sum + (p.scores[0]?.netScore || 0),
      0
    );
    const avgGross = playersWithScores > 0 ? totalGross / playersWithScores : 0;
    const avgNet = playersWithScores > 0 ? totalNet / playersWithScores : 0;

    res.json({
      teamId,
      totalPlayers,
      playersWithScores,
      avgGross: Math.round(avgGross * 10) / 10,
      avgNet: Math.round(avgNet * 10) / 10,
      participants,
    });
  } catch (error: any) {
    console.error('Get team stats error:', error);
    res.status(500).json({ error: 'Failed to fetch team stats', details: error.message });
  }
};
