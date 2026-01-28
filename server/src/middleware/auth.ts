import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { canManageClub, canManageTournament, canEditScorecard } from '../utils/permissions';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: number;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Require club admin or owner role
 * Checks clubId from route params or request body
 */
export const requireClubRole = (requiredRole: 'owner' | 'admin' = 'admin') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userId = req.user.id;
      const clubId = parseInt(req.params.clubId || req.body.clubId);

      if (!clubId || isNaN(clubId)) {
        throw new AppError('Club ID required', 400);
      }

      const canManage = await canManageClub(userId, clubId);

      if (!canManage) {
        res.status(403).json({ error: `Club ${requiredRole} access required` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require tournament admin role
 * Checks tournamentId from route params or request body
 */
export const requireTournamentRole = (requiredRole: 'admin' = 'admin') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userId = req.user.id;
      const tournamentId = parseInt(
        req.params.id || req.params.tournamentId || req.body.tournamentId
      );

      if (!tournamentId || isNaN(tournamentId)) {
        throw new AppError('Tournament ID required', 400);
      }

      const canManage = await canManageTournament(userId, tournamentId);

      if (!canManage) {
        res.status(403).json({ error: 'Tournament admin access required' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require scorecard edit access
 * Checks if user can edit a specific user's scorecard
 */
export const requireScorecardAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const tournamentId = parseInt(req.body.tournamentId);
    const targetUserId = parseInt(req.body.userId);

    if (!tournamentId || isNaN(tournamentId)) {
      throw new AppError('Tournament ID required', 400);
    }

    if (!targetUserId || isNaN(targetUserId)) {
      throw new AppError('User ID required', 400);
    }

    const hasAccess = await canEditScorecard(userId, tournamentId, targetUserId);

    if (!hasAccess) {
      res.status(403).json({ error: 'Cannot edit this scorecard' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * @deprecated Use requireClubRole or requireTournamentRole instead
 * Kept for backward compatibility during migration
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  console.warn(
    'DEPRECATED: requireAdmin middleware used. Migrate to entity-based role checks (requireClubRole, requireTournamentRole)'
  );

  // For backward compatibility, just pass through for now
  // This allows existing routes to continue working during migration
  next();
};
