import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAllTournaments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user's society
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { societyId: true },
    });

    const tournaments = await prisma.tournament.findMany({
      where: {
        societyId: user?.societyId || null,
      },
      include: {
        course: true,
        tournamentScores: {
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

    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: {
          include: {
            holes: {
              orderBy: {
                holeNumber: 'asc',
              },
            },
          },
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
    const { name, courseId, tournamentDate, isMajor, startTime, format } = req.body;
    const userId = req.user!.id;

    if (!name || !courseId || !tournamentDate) {
      throw new AppError('Name, course ID, and tournament date are required', 400);
    }

    // Get user's society
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { societyId: true },
    });

    const tournament = await prisma.tournament.create({
      data: {
        name,
        courseId: parseInt(courseId),
        tournamentDate: new Date(tournamentDate),
        startTime: startTime || null,
        format: format || 'Stroke Play',
        isMajor: isMajor !== undefined ? isMajor : true,
        status: 'upcoming',
        societyId: user?.societyId || null,
      },
      include: {
        course: true,
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
