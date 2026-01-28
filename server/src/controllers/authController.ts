import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config/env';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    console.log('Registration attempt for:', email, firstName, lastName);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Email already exists:', email);
      throw new AppError('Email already in use', 400);
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        createdAt: true,
      },
    });

    console.log('User created successfully:', user.id, user.email);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    console.log('Token generated, sending response');
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clubMemberships: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                inviteCode: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('User not found:', email);
      throw new AppError('Invalid credentials', 401);
    }

    console.log('User found, comparing password...');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentHandicap: user.currentHandicap,
      profilePhoto: user.profilePhoto,
      clubs: user.clubMemberships.map((m) => ({
        id: m.club.id,
        name: m.club.name,
        role: m.role,
      })),
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
                inviteCode: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userResponse = {
      ...user,
      clubs: user.clubMemberships.map((m) => ({
        id: m.club.id,
        name: m.club.name,
        role: m.role,
      })),
      clubMemberships: undefined, // Remove from response
    };

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};
