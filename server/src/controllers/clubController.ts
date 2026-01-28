import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateInviteCode, joinClubByInviteCode } from '../utils/inviteCodes';
import { isClubOwner } from '../utils/permissions';

/**
 * Create a new club
 */
export const createClub = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, defaultFormat } = req.body;
    const userId = req.user!.id;

    const club = await prisma.club.create({
      data: {
        name,
        defaultFormat: defaultFormat || 'Stroke Play',
        ownerId: userId,
        inviteCode: generateInviteCode(),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create owner membership
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId,
        role: 'owner',
      },
    });

    res.status(201).json(club);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all clubs the user is a member of
 */
export const getUserClubs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                members: true,
                tournaments: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const clubs = memberships.map((m) => ({
      ...m.club,
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json(clubs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific club
 */
export const getClubDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);
    const userId = req.user!.id;

    // Verify user is member
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) {
      throw new AppError('Not a member of this club', 403);
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                currentHandicap: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        tournaments: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            tournamentDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!club) {
      throw new AppError('Club not found', 404);
    }

    res.json({
      ...club,
      userRole: membership.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update club settings (admin only)
 */
export const updateClubSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);
    const { name, defaultFormat, allowSelfJoin } = req.body;

    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...(name && { name }),
        ...(defaultFormat && { defaultFormat }),
        ...(allowSelfJoin !== undefined && { allowSelfJoin }),
      },
    });

    res.json(club);
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate club invite code (admin only)
 */
export const regenerateInviteCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);

    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        inviteCode: generateInviteCode(),
      },
    });

    res.json({ inviteCode: club.inviteCode });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a club using invite code
 */
export const joinClubByCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user!.id;

    const result = await joinClubByInviteCode(userId, inviteCode);

    if (!result.success) {
      throw new AppError('Already a member of this club', 400);
    }

    const membership = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: result.clubId, userId } },
      include: {
        club: true,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a member's role (admin only, cannot change owner)
 */
export const updateMemberRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);
    const memberId = parseInt(req.params.memberId as string);
    const { role } = req.body;

    // Validate role
    if (!['owner', 'admin', 'player', 'spectator'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    // Get the member to check if they're owner
    const member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Cannot change owner role
    if (member.role === 'owner') {
      throw new AppError('Cannot change owner role', 400);
    }

    // Cannot promote to owner (only one owner per club)
    if (role === 'owner') {
      throw new AppError('Cannot promote to owner role', 400);
    }

    const updated = await prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId: memberId } },
      data: { role },
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

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from club (admin only, cannot remove owner)
 */
export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);
    const memberId = parseInt(req.params.memberId as string);

    // Get the member to check if they're owner
    const member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      throw new AppError('Cannot remove club owner', 400);
    }

    await prisma.clubMember.delete({
      where: { clubId_userId: { clubId, userId: memberId } },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Transfer club ownership (owner only)
 */
export const transferOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clubId = parseInt(req.params.clubId as string);
    const { newOwnerId } = req.body;
    const currentUserId = req.user!.id;

    // Verify current user is owner
    const isOwner = await isClubOwner(currentUserId, clubId);
    if (!isOwner) {
      throw new AppError('Only club owner can transfer ownership', 403);
    }

    // Verify new owner is a member
    const newOwnerMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: newOwnerId } },
    });

    if (!newOwnerMember) {
      throw new AppError('New owner must be a club member', 400);
    }

    // Transaction: update club owner, demote current owner, promote new owner
    await prisma.$transaction([
      // Update club owner
      prisma.club.update({
        where: { id: clubId },
        data: { ownerId: newOwnerId },
      }),
      // Demote current owner to admin
      prisma.clubMember.update({
        where: { clubId_userId: { clubId, userId: currentUserId } },
        data: { role: 'admin' },
      }),
      // Promote new owner
      prisma.clubMember.update({
        where: { clubId_userId: { clubId, userId: newOwnerId } },
        data: { role: 'owner' },
      }),
    ]);

    res.json({ message: 'Ownership transferred successfully' });
  } catch (error) {
    next(error);
  }
};
