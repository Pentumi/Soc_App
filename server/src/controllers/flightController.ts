import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageTournament } from '../utils/permissions';

/**
 * Create a new flight for a tournament
 * POST /api/tournaments/:tournamentId/flights
 */
export const createFlight = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can create flights' });
    }

    const { name, minHandicap, maxHandicap, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Flight name is required' });
    }

    const flight = await prisma.flight.create({
      data: {
        tournamentId,
        name,
        minHandicap: minHandicap ? parseFloat(minHandicap) : null,
        maxHandicap: maxHandicap ? parseFloat(maxHandicap) : null,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json(flight);
  } catch (error: any) {
    console.error('Create flight error:', error);
    res.status(500).json({ error: 'Failed to create flight', details: error.message });
  }
};

/**
 * Get all flights for a tournament
 * GET /api/tournaments/:tournamentId/flights
 */
export const getFlights = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);

    const flights = await prisma.flight.findMany({
      where: { tournamentId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    res.json(flights);
  } catch (error: any) {
    console.error('Get flights error:', error);
    res.status(500).json({ error: 'Failed to fetch flights', details: error.message });
  }
};

/**
 * Update a flight
 * PUT /api/tournaments/:tournamentId/flights/:flightId
 */
export const updateFlight = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const flightId = parseInt(req.params.flightId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can update flights' });
    }

    const { name, minHandicap, maxHandicap, sortOrder } = req.body;

    const flight = await prisma.flight.update({
      where: { id: flightId },
      data: {
        ...(name && { name }),
        ...(minHandicap !== undefined && { minHandicap: minHandicap ? parseFloat(minHandicap) : null }),
        ...(maxHandicap !== undefined && { maxHandicap: maxHandicap ? parseFloat(maxHandicap) : null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json(flight);
  } catch (error: any) {
    console.error('Update flight error:', error);
    res.status(500).json({ error: 'Failed to update flight', details: error.message });
  }
};

/**
 * Delete a flight
 * DELETE /api/tournaments/:tournamentId/flights/:flightId
 */
export const deleteFlight = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);
    const flightId = parseInt(req.params.flightId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can delete flights' });
    }

    // Check if flight belongs to this tournament
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight || flight.tournamentId !== tournamentId) {
      return res.status(404).json({ error: 'Flight not found in this tournament' });
    }

    await prisma.flight.delete({
      where: { id: flightId },
    });

    res.json({ success: true, message: 'Flight deleted successfully' });
  } catch (error: any) {
    console.error('Delete flight error:', error);
    res.status(500).json({ error: 'Failed to delete flight', details: error.message });
  }
};

/**
 * Auto-assign players to flights based on handicap
 * POST /api/tournaments/:tournamentId/flights/auto-assign
 */
export const autoAssignFlights = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tournamentId = parseInt(req.params.tournamentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user can manage tournament
    const canManage = await canManageTournament(userId, tournamentId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only tournament admins can auto-assign flights' });
    }

    // Get all flights for this tournament, sorted by handicap range
    const flights = await prisma.flight.findMany({
      where: { tournamentId },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    if (flights.length === 0) {
      return res.status(400).json({ error: 'No flights found for this tournament' });
    }

    // Get all players (participants with role 'player')
    const players = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        role: 'player',
      },
      include: {
        user: {
          select: {
            currentHandicap: true,
          },
        },
      },
    });

    if (players.length === 0) {
      return res.status(400).json({ error: 'No players registered for this tournament' });
    }

    // Auto-assign logic
    const assignments: { participantId: number; flightId: number }[] = [];

    for (const player of players) {
      const handicap = player.user.currentHandicap
        ? parseFloat(player.user.currentHandicap.toString())
        : null;

      // Find appropriate flight based on handicap
      let assignedFlight: typeof flights[0] | null = null;

      if (handicap !== null) {
        // Try to find flight with matching handicap range
        for (const flight of flights) {
          const minH = flight.minHandicap ? parseFloat(flight.minHandicap.toString()) : null;
          const maxH = flight.maxHandicap ? parseFloat(flight.maxHandicap.toString()) : null;

          // Check if handicap falls within range
          if (minH !== null && maxH !== null) {
            if (handicap >= minH && handicap <= maxH) {
              assignedFlight = flight;
              break;
            }
          } else if (minH !== null && maxH === null) {
            // Only min specified (e.g., 18+)
            if (handicap >= minH) {
              assignedFlight = flight;
              break;
            }
          } else if (minH === null && maxH !== null) {
            // Only max specified (e.g., up to 10)
            if (handicap <= maxH) {
              assignedFlight = flight;
              break;
            }
          }
        }
      }

      // If no matching flight found, assign to first flight (default)
      if (!assignedFlight) {
        assignedFlight = flights[0];
      }

      assignments.push({
        participantId: player.id,
        flightId: assignedFlight.id,
      });

      // Update participant with flight assignment
      await prisma.tournamentParticipant.update({
        where: { id: player.id },
        data: { flightId: assignedFlight.id },
      });
    }

    res.json({
      success: true,
      message: `Auto-assigned ${assignments.length} players to flights`,
      assignments,
    });
  } catch (error: any) {
    console.error('Auto-assign flights error:', error);
    res.status(500).json({ error: 'Failed to auto-assign flights', details: error.message });
  }
};

/**
 * Get flight leaderboard
 * GET /api/tournaments/:tournamentId/flights/:flightId/leaderboard
 */
export const getFlightLeaderboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const flightId = parseInt(req.params.flightId);

    // Get all participants in this flight
    const participants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        flightId,
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
        scores: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Sort by score (if available)
    const leaderboard = participants
      .map((p) => ({
        ...p,
        score: p.scores[0] || null,
      }))
      .sort((a, b) => {
        if (!a.score) return 1;
        if (!b.score) return -1;
        return a.score.netScore - b.score.netScore;
      });

    res.json(leaderboard);
  } catch (error: any) {
    console.error('Get flight leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch flight leaderboard', details: error.message });
  }
};
