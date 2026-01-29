import prisma from '../config/database';

/**
 * Calculate league season standings based on tournament results
 * Uses the league's points system to award points based on position
 */
export async function calculateLeagueStandings(leagueId: number) {
  try {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        tournaments: {
          where: { status: 'completed' },
          include: {
            tournamentScores: {
              include: {
                user: true,
              },
              orderBy: {
                netScore: 'asc', // Lower score = better position
              },
            },
          },
        },
      },
    });

    if (!league) {
      throw new Error('League not found');
    }

    // Get points system from league settings
    const pointsSystem = (league.pointsSystem as any) || {
      win: 10,
      second: 7,
      third: 5,
      participation: 1,
    };

    // Calculate points for each member
    const memberPoints: { [userId: number]: { points: number; eventsPlayed: number } } = {};

    for (const tournament of league.tournaments) {
      const scores = tournament.tournamentScores;

      // Award points based on position
      scores.forEach((score, index) => {
        const position = index + 1;
        let points = pointsSystem.participation || 1; // Default participation points

        // Award special points for top positions
        if (position === 1) {
          points = pointsSystem.win || 10;
        } else if (position === 2) {
          points = pointsSystem.second || 7;
        } else if (position === 3) {
          points = pointsSystem.third || 5;
        } else if (pointsSystem[`position${position}`]) {
          // Support custom position points like position4, position5, etc.
          points = pointsSystem[`position${position}`];
        }

        // Initialize member points if not exists
        if (!memberPoints[score.userId]) {
          memberPoints[score.userId] = { points: 0, eventsPlayed: 0 };
        }

        memberPoints[score.userId].points += points;
        memberPoints[score.userId].eventsPlayed += 1;
      });
    }

    // Update all league members with calculated points
    for (const [userId, data] of Object.entries(memberPoints)) {
      await prisma.leagueMember.updateMany({
        where: {
          leagueId,
          userId: parseInt(userId),
        },
        data: {
          seasonPoints: data.points,
          eventsPlayed: data.eventsPlayed,
        },
      });
    }

    return memberPoints;
  } catch (error) {
    console.error('Calculate league standings error:', error);
    throw error;
  }
}

/**
 * Update member points after a tournament is completed
 * Called when a tournament status changes to 'completed'
 */
export async function updateMemberPoints(leagueId: number, userId: number, tournamentId: number) {
  try {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      throw new Error('League not found');
    }

    // Get points system
    const pointsSystem = (league.pointsSystem as any) || {
      win: 10,
      second: 7,
      third: 5,
      participation: 1,
    };

    // Get tournament scores to determine position
    const tournamentScores = await prisma.tournamentScore.findMany({
      where: { tournamentId },
      orderBy: {
        netScore: 'asc',
      },
    });

    // Find user's position
    const userScoreIndex = tournamentScores.findIndex((score) => score.userId === userId);
    if (userScoreIndex === -1) {
      throw new Error('User score not found in tournament');
    }

    const position = userScoreIndex + 1;
    let points = pointsSystem.participation || 1;

    // Award points based on position
    if (position === 1) {
      points = pointsSystem.win || 10;
    } else if (position === 2) {
      points = pointsSystem.second || 7;
    } else if (position === 3) {
      points = pointsSystem.third || 5;
    } else if (pointsSystem[`position${position}`]) {
      points = pointsSystem[`position${position}`];
    }

    // Get current member data
    const member = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error('User is not a league member');
    }

    // Update member points
    await prisma.leagueMember.update({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
      data: {
        seasonPoints: {
          increment: points,
        },
        eventsPlayed: {
          increment: 1,
        },
      },
    });

    return { points, position };
  } catch (error) {
    console.error('Update member points error:', error);
    throw error;
  }
}

/**
 * Recalculate all standings for a league from scratch
 * Useful when points system changes or to fix inconsistencies
 */
export async function recalculateLeagueStandings(leagueId: number) {
  try {
    // Reset all member points first
    await prisma.leagueMember.updateMany({
      where: { leagueId },
      data: {
        seasonPoints: 0,
        eventsPlayed: 0,
      },
    });

    // Recalculate from tournaments
    return await calculateLeagueStandings(leagueId);
  } catch (error) {
    console.error('Recalculate league standings error:', error);
    throw error;
  }
}
