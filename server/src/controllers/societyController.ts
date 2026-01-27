import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createSociety = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, defaultFormat } = req.body;
    const userId = req.user!.id;

    // Check if user already has a society
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { society: true },
    });

    if (existingUser?.societyId) {
      res.status(400).json({ error: 'User already belongs to a society' });
      return;
    }

    // Create society
    const society = await prisma.society.create({
      data: {
        name,
        defaultFormat: defaultFormat || 'Stroke Play',
      },
    });

    // Update user to belong to this society and make them admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        societyId: society.id,
        role: 'admin',
      },
    });

    res.status(201).json(society);
  } catch (error) {
    next(error);
  }
};

export const getSociety = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        society: {
          include: {
            users: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentHandicap: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!user?.society) {
      res.status(404).json({ error: 'Society not found' });
      return;
    }

    res.json(user.society);
  } catch (error) {
    next(error);
  }
};

export const updateSociety = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, defaultFormat } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { society: true },
    });

    if (!user?.society) {
      res.status(404).json({ error: 'Society not found' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can update society settings' });
      return;
    }

    const updatedSociety = await prisma.society.update({
      where: { id: user.societyId! },
      data: {
        ...(name && { name }),
        ...(defaultFormat && { defaultFormat }),
      },
    });

    res.json(updatedSociety);
  } catch (error) {
    next(error);
  }
};
