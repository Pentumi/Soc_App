import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAllMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user's club memberships
    const clubMemberships = await prisma.clubMember.findMany({
      where: { userId },
      select: { clubId: true },
    });

    const clubIds = clubMemberships.map((m) => m.clubId);

    // Get all members from user's clubs
    const members = await prisma.user.findMany({
      where: {
        clubMemberships: {
          some: {
            clubId: { in: clubIds },
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        profilePhoto: true,
        createdAt: true,
        clubMemberships: {
          where: {
            clubId: { in: clubIds },
          },
          select: {
            role: true,
            clubId: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const getMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const member = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        profilePhoto: true,
        createdAt: true,
        clubMemberships: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tournamentScores: {
          include: {
            tournament: {
              include: {
                course: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        handicapHistory: {
          orderBy: {
            effectiveDate: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const createMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, currentHandicap, profilePhoto } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, password, first name, and last name are required', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const member = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        currentHandicap: currentHandicap ? parseFloat(currentHandicap) : null,
        profilePhoto,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        profilePhoto: true,
        createdAt: true,
      },
    });

    if (currentHandicap) {
      await prisma.handicapHistory.create({
        data: {
          userId: member.id,
          handicapIndex: parseFloat(currentHandicap),
          reason: 'initial_handicap',
          effectiveDate: new Date(),
        },
      });
    }

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, currentHandicap, profilePhoto } = req.body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    if (currentHandicap !== undefined) {
      updateData.currentHandicap = currentHandicap ? parseFloat(currentHandicap) : null;
    }

    const member = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        profilePhoto: true,
        updatedAt: true,
      },
    });

    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Listing all users in database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${users.length} users`);
    res.json({ count: users.length, users });
  } catch (error) {
    next(error);
  }
};
