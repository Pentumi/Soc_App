import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Points allocation based on finishing position
function getPointsForPosition(position: number, totalPlayers: number): number {
  if (position === 1) return 50;
  if (position === 2) return 45;
  if (position === 3) return 40;
  if (position === 4) return 37;
  if (position === 5) return 35;
  if (position === 6) return 33;
  if (position === 7) return 31;
  if (position === 8) return 30;
  if (position === 9) return 29;
  if (position === 10) return 28;

  // For positions 11 and below, decrease by 1 point
  const points = 28 - (position - 10);
  return Math.max(points, 10); // Minimum 10 points for participation
}

export const getYearStandings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { year } = req.query;

    // Get user's society
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { societyId: true },
    });

    // Get current year if not specified
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Get all completed tournaments for the year
    const tournaments = await prisma.tournament.findMany({
      where: {
        societyId: user?.societyId || null,
        status: 'completed',
        tournamentDate: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`),
        },
      },
      include: {
        tournamentScores: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            netScore: 'asc',
          },
        },
      },
      orderBy: {
        tournamentDate: 'asc',
      },
    });

    // Calculate standings
    const playerStandings: Record<number, {
      userId: number;
      name: string;
      tournaments: { name: string; points: number; position: number }[];
      totalPoints: number;
      best5Points: number;
      averagePoints: number;
      tournamentsPlayed: number;
    }> = {};

    // Process each tournament
    tournaments.forEach((tournament) => {
      const scores = tournament.tournamentScores;
      const totalPlayers = scores.length;

      // Assign positions and points
      scores.forEach((score, index) => {
        const position = score.position || (index + 1);
        const points = getPointsForPosition(position, totalPlayers);

        if (!playerStandings[score.userId]) {
          playerStandings[score.userId] = {
            userId: score.userId,
            name: `${score.user?.firstName} ${score.user?.lastName}`,
            tournaments: [],
            totalPoints: 0,
            best5Points: 0,
            averagePoints: 0,
            tournamentsPlayed: 0,
          };
        }

        playerStandings[score.userId].tournaments.push({
          name: tournament.name,
          points,
          position,
        });
        playerStandings[score.userId].totalPoints += points;
        playerStandings[score.userId].tournamentsPlayed += 1;
      });
    });

    // Calculate best 5 and averages
    Object.values(playerStandings).forEach((player) => {
      // Sort tournaments by points (highest first) and take top 5
      const sortedTournaments = [...player.tournaments].sort((a, b) => b.points - a.points);
      const best5 = sortedTournaments.slice(0, 5);
      player.best5Points = best5.reduce((sum, t) => sum + t.points, 0);
      player.averagePoints = player.tournamentsPlayed > 0
        ? Math.round((player.totalPoints / player.tournamentsPlayed) * 10) / 10
        : 0;
    });

    // Convert to array and sort by best 5 points
    const standings = Object.values(playerStandings).sort((a, b) => b.best5Points - a.best5Points);

    res.json({
      year: targetYear,
      tournaments: tournaments.map(t => ({
        id: t.id,
        name: t.name,
        date: t.tournamentDate,
      })),
      standings,
    });
  } catch (error) {
    next(error);
  }
};
