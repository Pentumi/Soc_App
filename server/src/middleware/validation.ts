import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateRegister = (req: Request, _res: Response, next: NextFunction): void => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('All fields are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  next();
};

export const validateLogin = (req: Request, _res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  next();
};

export const validateTournamentScore = (req: Request, _res: Response, next: NextFunction): void => {
  const { tournamentId, userId, grossScore, holeScores } = req.body;

  if (!tournamentId || !userId) {
    throw new AppError('Tournament ID and user ID are required', 400);
  }

  // Either grossScore or holeScores must be provided
  if (grossScore === undefined && !holeScores) {
    throw new AppError('Either gross score or hole scores are required', 400);
  }

  // Validate grossScore if provided
  if (grossScore !== undefined && (grossScore < 0 || grossScore > 200)) {
    throw new AppError('Invalid gross score', 400);
  }

  // Validate holeScores if provided
  if (holeScores) {
    if (!Array.isArray(holeScores)) {
      throw new AppError('Hole scores must be an array', 400);
    }

    for (const holeScore of holeScores) {
      if (!holeScore.holeId || !holeScore.strokes) {
        throw new AppError('Each hole score must have holeId and strokes', 400);
      }
    }
  }

  next();
};
