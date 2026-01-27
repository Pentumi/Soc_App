import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config/env';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'member' } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentHandicap: user.currentHandicap,
      role: user.role,
      profilePhoto: user.profilePhoto,
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
        role: true,
        profilePhoto: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
