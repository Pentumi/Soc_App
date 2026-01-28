import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateInviteCode, joinTournamentByInviteCode } from '../utils/inviteCodes';
import { canViewTournament } from '../utils/permissions';

export const getAllTournaments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all clubs user is member of
    const clubMemberships = await prisma.clubMember.findMany({
      where: { userId },
      select: { clubId: true },
    });

    const clubIds = clubMemberships.map((m) => m.clubId);

    const tournaments = await prisma.tournament.findMany({
      where: {
        clubId: { in: clubIds },
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            location: true,
            par: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
        tournamentScores: {
          select: {
            id: true,
            userId: true,
            grossScore: true,
            netScore: true,
          },
        },
      },
      orderBy: {
        tournamentDate: 'desc',
      },
    });

    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

export const getTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc',
              },
            },
          },
        },
        participants: {
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
          orderBy: [{ status: 'asc' }, { joinedAt: 'asc' }],
        },
        tournamentScores: {
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
          orderBy: {
            netScore: 'asc',
          },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Check if user can view tournament
    const hasAccess = await canViewTournament(userId, tournament.id);
    if (!hasAccess) {
      throw new AppError('Not authorized to view this tournament', 403);
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const createTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      courseId,
      tournamentDate,
      isMajor,
      startTime,
      format,
      clubId,
      allowSelfJoin,
      playerCap,
      leaderboardVisible,
    } = req.body;
    const userId = req.user!.id;

    if (!name || !courseId || !tournamentDate || !clubId) {
      throw new AppError('Name, course ID, tournament date, and club ID are required', 400);
    }

    // Verify user is club admin
    const clubMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: parseInt(clubId), userId } },
    });

    if (!clubMember || (clubMember.role !== 'owner' && clubMember.role !== 'admin')) {
      throw new AppError('Must be club admin to create tournaments', 403);
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        clubId: parseInt(clubId),
        courseId: parseInt(courseId),
        tournamentDate: new Date(tournamentDate),
        startTime: startTime || null,
        format: format || 'Stroke Play',
        isMajor: isMajor !== undefined ? isMajor : true,
        status: 'upcoming',
        inviteCode: generateInviteCode(),
        allowSelfJoin: allowSelfJoin || false,
        playerCap: playerCap ? parseInt(playerCap) : null,
        leaderboardVisible: leaderboardVisible !== undefined ? leaderboardVisible : true,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        course: true,
      },
    });

    // Automatically add creator as tournament admin
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId,
        role: 'admin',
        status: 'registered',
      },
    });

    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, courseId, tournamentDate, isMajor, status, startTime, format, allowEditWithScores } = req.body;

    // Check if tournament exists and has scores
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournamentScores: true,
      },
    });

    if (!existingTournament) {
      throw new AppError('Tournament not found', 404);
    }

    const hasScores = existingTournament.tournamentScores.length > 0;

    // If tournament has scores and we're trying to change course, prevent it
    if (hasScores && courseId !== undefined && parseInt(courseId) !== existingTournament.courseId) {
      throw new AppError('Cannot change course when tournament has existing scores. Delete scores first.', 400);
    }

    // If tournament has scores and allowEditWithScores is not explicitly true, warn
    if (hasScores && !allowEditWithScores && (name !== undefined || tournamentDate !== undefined || isMajor !== undefined)) {
      throw new AppError(
        'Tournament has existing scores. Set allowEditWithScores to true to confirm update.',
        400
      );
    }

    // If courseId is being changed, verify the new course exists
    if (courseId !== undefined) {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) },
      });

      if (!course) {
        throw new AppError('Course not found', 404);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (courseId !== undefined) updateData.courseId = parseInt(courseId);
    if (tournamentDate !== undefined) updateData.tournamentDate = new Date(tournamentDate);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (format !== undefined) updateData.format = format;
    if (isMajor !== undefined) updateData.isMajor = isMajor;
    if (status !== undefined) updateData.status = status;

    const tournament = await prisma.tournament.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        course: true,
      },
    });

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Fetch tournament with scores to provide metadata for confirmation
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        tournamentScores: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Delete tournament (cascade will handle scores and hole scores)
    await prisma.tournament.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Join tournament (using invite code or if user is club member)
 */
export const joinTournament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id);
    const userId = req.user!.id;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          where: { status: 'registered' },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Check if user is club member
    const clubMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: tournament.clubId, userId } },
    });

    if (!clubMember) {
      throw new AppError('Must be a club member to join tournament', 403);
    }

    // Check if already participant
    const existing = await prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });

    if (existing) {
      throw new AppError('Already registered for this tournament', 400);
    }

    // Determine status based on player cap
    let status = 'registered';
    if (tournament.playerCap) {
      const currentPlayers = tournament.participants.length;
      if (currentPlayers >= tournament.playerCap) {
        status = 'waitlist';
      }
    }

    const participant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
        role: 'player',
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
};

/**
 * Update tournament participant (admin only)
 */
export const updateParticipant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id as string);
    const participantUserId = parseInt(req.params.userId as string);
    const { role, team, flight, status } = req.body;

    const participant = await prisma.tournamentParticipant.update({
      where: {
        tournamentId_userId: { tournamentId, userId: participantUserId },
      },
      data: {
        ...(role && { role }),
        ...(team !== undefined && { team }),
        ...(flight !== undefined && { flight }),
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(participant);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove tournament participant (admin only)
 */
export const removeParticipant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id as string);
    const participantUserId = parseInt(req.params.userId as string);

    await prisma.tournamentParticipant.delete({
      where: {
        tournamentId_userId: { tournamentId, userId: participantUserId },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Join tournament by invite code
 */
export const joinByInviteCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user!.id;

    const result = await joinTournamentByInviteCode(userId, inviteCode);

    if (!result.success) {
      throw new AppError('Already registered for this tournament', 400);
    }

    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: { tournamentId: result.tournamentId, userId },
      },
      include: {
        tournament: {
          include: {
            club: true,
            course: true,
          },
        },
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
};
