import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export const adjustHandicapsForTournament = async (tournamentId: number): Promise<void> => {
  const scores = await prisma.tournamentScore.findMany({
    where: {
      tournamentId,
    },
    include: {
      user: true,
    },
    orderBy: {
      netScore: 'asc',
    },
  });

  if (scores.length === 0) {
    throw new Error('No scores found for this tournament');
  }

  for (let i = 0; i < scores.length; i++) {
    const score = scores[i];
    let adjustment = 0;
    let reason = '';
    const position = i + 1;

    if (i === 0) {
      adjustment = -2;
      reason = 'tournament_win';
    } else if (i === scores.length - 1) {
      adjustment = 1;
      reason = 'tournament_last';
    }

    await prisma.tournamentScore.update({
      where: { id: score.id },
      data: {
        position,
        handicapAdjustment: adjustment,
      },
    });

    if (adjustment !== 0) {
      const currentHandicap = score.user.currentHandicap
        ? parseFloat(score.user.currentHandicap.toString())
        : 0;
      const newHandicap = Math.max(0, currentHandicap + adjustment);

      await prisma.user.update({
        where: { id: score.userId },
        data: {
          currentHandicap: new Decimal(newHandicap),
        },
      });

      await prisma.handicapHistory.create({
        data: {
          userId: score.userId,
          handicapIndex: new Decimal(newHandicap),
          tournamentId,
          reason,
          effectiveDate: new Date(),
        },
      });
    }
  }
};

export const calculateNetScore = (grossScore: number, handicap: number): number => {
  return Math.round(grossScore - handicap);
};
