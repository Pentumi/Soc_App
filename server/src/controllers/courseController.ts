import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAllCourses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, location, par, slopeRating, courseRating, holes } = req.body;

    if (!name || !par) {
      throw new AppError('Name and par are required', 400);
    }

    const course = await prisma.course.create({
      data: {
        name,
        location,
        par: parseInt(par),
        slopeRating: slopeRating ? parseFloat(slopeRating) : null,
        courseRating: courseRating ? parseFloat(courseRating) : null,
        holes: holes
          ? {
              create: holes.map((hole: any) => ({
                holeNumber: parseInt(hole.holeNumber),
                par: parseInt(hole.par),
                strokeIndex: hole.strokeIndex ? parseInt(hole.strokeIndex) : null,
                yardage: hole.yardage ? parseInt(hole.yardage) : null,
              })),
            }
          : undefined,
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc',
          },
        },
      },
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, location, par, slopeRating, courseRating } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (par !== undefined) updateData.par = parseInt(par);
    if (slopeRating !== undefined) updateData.slopeRating = parseFloat(slopeRating);
    if (courseRating !== undefined) updateData.courseRating = parseFloat(courseRating);

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc',
          },
        },
      },
    });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.course.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
