import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Generate a new UUID invite code
 */
export function generateInviteCode(): string {
  return uuidv4();
}

/**
 * Find and validate a club by invite code
 */
export async function validateClubInviteCode(code: string): Promise<number | null> {
  const club = await prisma.club.findUnique({
    where: { inviteCode: code },
    select: { id: true },
  });
  return club?.id || null;
}

/**
 * Find and validate a tournament by invite code
 */
export async function validateTournamentInviteCode(code: string): Promise<number | null> {
  const tournament = await prisma.tournament.findUnique({
    where: { inviteCode: code },
    select: { id: true },
  });
  return tournament?.id || null;
}

/**
 * Join a club using an invite code
 * Returns true if successfully joined, false if already a member
 * Throws error if invite code is invalid
 */
export async function joinClubByInviteCode(
  userId: number,
  inviteCode: string
): Promise<{ success: boolean; clubId: number }> {
  const clubId = await validateClubInviteCode(inviteCode);

  if (!clubId) {
    throw new AppError('Invalid invite code', 404);
  }

  // Check if already member
  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
  });

  if (existing) {
    return { success: false, clubId };
  }

  // Check if club allows self-join
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { allowSelfJoin: true },
  });

  // Add as player (or spectator if self-join is disabled)
  const role = club?.allowSelfJoin ? 'player' : 'spectator';

  await prisma.clubMember.create({
    data: {
      clubId,
      userId,
      role,
    },
  });

  return { success: true, clubId };
}

/**
 * Join a tournament using an invite code
 * Handles player cap and waitlist logic
 */
export async function joinTournamentByInviteCode(
  userId: number,
  inviteCode: string
): Promise<{
  success: boolean;
  tournamentId: number;
  status: 'registered' | 'waitlist';
  role: 'player' | 'spectator';
}> {
  const tournamentId = await validateTournamentInviteCode(inviteCode);

  if (!tournamentId) {
    throw new AppError('Invalid invite code', 404);
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        where: { status: 'registered' },
      },
    },
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  // Check if user is a club member
  const clubMember = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: tournament.clubId, userId } },
  });

  if (!clubMember) {
    throw new AppError('Must be a club member to join tournament', 403);
  }

  // Check if already participant
  const existing = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  });

  if (existing) {
    return {
      success: false,
      tournamentId,
      status: existing.status as 'registered' | 'waitlist',
      role: existing.role as 'player' | 'spectator',
    };
  }

  // Determine role and status
  let role: 'player' | 'spectator' = 'spectator';
  let status: 'registered' | 'waitlist' = 'registered';

  if (tournament.allowSelfJoin) {
    // Check player cap
    if (tournament.playerCap) {
      const currentPlayers = tournament.participants.length;
      if (currentPlayers >= tournament.playerCap) {
        role = 'player';
        status = 'waitlist';
      } else {
        role = 'player';
        status = 'registered';
      }
    } else {
      // No cap - register as player
      role = 'player';
      status = 'registered';
    }
  }

  // Create participant
  await prisma.tournamentParticipant.create({
    data: {
      tournamentId,
      userId,
      role,
      status,
    },
  });

  return { success: true, tournamentId, status, role };
}

/**
 * Regenerate invite code for a club
 */
export async function regenerateClubInviteCode(clubId: number): Promise<string> {
  const newCode = generateInviteCode();

  await prisma.club.update({
    where: { id: clubId },
    data: { inviteCode: newCode },
  });

  return newCode;
}

/**
 * Regenerate invite code for a tournament
 */
export async function regenerateTournamentInviteCode(tournamentId: number): Promise<string> {
  const newCode = generateInviteCode();

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { inviteCode: newCode },
  });

  return newCode;
}
