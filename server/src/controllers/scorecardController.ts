import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get scorecard for a specific user in a tournament
 * Access: Tournament admin, the user themselves, or flight-mates
 */
export const getUserScorecard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId as string);
    const targetUserId = parseInt(req.params.userId as string);
    const currentUserId = req.user!.id;

    // Get tournament with participants
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
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

    // Find current user's participant record
    const currentUserParticipant = tournament.participants.find(
      (p) => p.userId === currentUserId
    );

    if (!currentUserParticipant) {
      throw new AppError('You are not a participant in this tournament', 403);
    }

    // Find target user's participant record
    const targetUserParticipant = tournament.participants.find(
      (p) => p.userId === targetUserId
    );

    if (!targetUserParticipant) {
      throw new AppError('User is not a participant in this tournament', 404);
    }

    // Check access permissions
    const isAdmin = currentUserParticipant.role === 'admin';
    const isSelf = currentUserId === targetUserId;
    const isSameFlight =
      currentUserParticipant.flight &&
      currentUserParticipant.flight === targetUserParticipant.flight;

    if (!isAdmin && !isSelf && !isSameFlight) {
      throw new AppError('You do not have access to view this scorecard', 403);
    }

    // Get the score with hole scores
    const score = await prisma.tournamentScore.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: targetUserId,
        },
      },
      include: {
        holeScores: {
          include: {
            hole: true,
          },
          orderBy: {
            hole: {
              holeNumber: 'asc',
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentHandicap: true,
          },
        },
      },
    });

    res.json({
      participant: targetUserParticipant,
      score,
      course: tournament.course,
      canEdit: isAdmin || isSelf || isSameFlight,
      isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all scorecards for a specific flight
 * Access: Tournament admin or flight members
 */
export const getFlightScorecards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId as string);
    const flight = req.params.flight as string;
    const currentUserId = req.user!.id;

    // Get tournament with participants in the flight
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          where: { flight: flight },
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

    // Check if current user is in this flight or is admin
    const allParticipants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
    });

    const currentUserParticipant = allParticipants.find(
      (p) => p.userId === currentUserId
    );

    if (!currentUserParticipant) {
      throw new AppError('You are not a participant in this tournament', 403);
    }

    const isAdmin = currentUserParticipant.role === 'admin';
    const isInFlight = currentUserParticipant.flight === flight;

    if (!isAdmin && !isInFlight) {
      throw new AppError('You do not have access to view this flight', 403);
    }

    // Get scores for all participants in the flight
    const participantIds = tournament.participants.map((p: any) => p.userId);
    const scores = await prisma.tournamentScore.findMany({
      where: {
        tournamentId,
        userId: { in: participantIds },
      },
      include: {
        holeScores: {
          include: {
            hole: true,
          },
          orderBy: {
            hole: {
              holeNumber: 'asc',
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentHandicap: true,
          },
        },
      },
    });

    res.json({
      flight,
      participants: (tournament as any).participants,
      scores,
      course: (tournament as any).course,
      canEdit: isAdmin || isInFlight,
      isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all flights for a tournament
 * Access: Any tournament participant
 */
export const getTournamentFlights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.tournamentId as string);
    const currentUserId = req.user!.id;

    // Check if user is a participant
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) {
      throw new AppError('You are not a participant in this tournament', 403);
    }

    // Get all unique flights
    const participants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        flight: { not: null },
      },
      select: {
        flight: true,
      },
      distinct: ['flight'],
    });

    const flights = participants
      .map((p) => p.flight)
      .filter((f): f is string => f !== null)
      .sort();

    res.json({
      flights,
      currentUserFlight: participant.flight,
      isAdmin: participant.role === 'admin',
    });
  } catch (error) {
    next(error);
  }
};
