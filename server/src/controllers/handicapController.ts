import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getHandicapHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const history = await prisma.handicapHistory.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const manualHandicapAdjustment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const { newHandicap, reason } = req.body;

    if (newHandicap === undefined) {
      throw new AppError('New handicap value is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        currentHandicap: parseFloat(newHandicap),
      },
    });

    await prisma.handicapHistory.create({
      data: {
        userId: parseInt(userId),
        handicapIndex: parseFloat(newHandicap),
        reason: reason || 'manual_adjustment',
        effectiveDate: new Date(),
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        currentHandicap: true,
        email: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
