import prisma from '../config/database';

export type ClubRole = 'owner' | 'admin' | 'player' | 'spectator';
export type TournamentRole = 'admin' | 'player' | 'spectator';

/**
 * Get user's role in a specific club
 */
export async function getUserClubRole(userId: number, clubId: number): Promise<ClubRole | null> {
  const membership = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId } },
    select: { role: true },
  });
  return membership?.role as ClubRole || null;
}

/**
 * Get user's role in a specific tournament
 */
export async function getUserTournamentRole(userId: number, tournamentId: number): Promise<TournamentRole | null> {
  const participant = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
    select: { role: true },
  });
  return participant?.role as TournamentRole || null;
}

/**
 * Check if user can manage a club (owner or admin)
 */
export async function canManageClub(userId: number, clubId: number): Promise<boolean> {
  const role = await getUserClubRole(userId, clubId);
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage a tournament (admin)
 */
export async function canManageTournament(userId: number, tournamentId: number): Promise<boolean> {
  // First check tournament-level admin role
  const tournamentRole = await getUserTournamentRole(userId, tournamentId);
  if (tournamentRole === 'admin') return true;

  // Also check if user is club admin/owner
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { clubId: true },
  });

  if (!tournament) return false;

  return await canManageClub(userId, tournament.clubId);
}

/**
 * Check if user can edit a specific scorecard
 * Rules:
 * - Tournament admins can edit any scorecard
 * - Club admins/owners can edit any scorecard in their club's tournaments
 * - Players can edit their own scorecard
 * - Players can edit groupmates' scorecards (same flight)
 */
export async function canEditScorecard(
  userId: number,
  tournamentId: number,
  targetUserId: number
): Promise<boolean> {
  // Check 1: Is user a tournament/club admin?
  const canManage = await canManageTournament(userId, tournamentId);
  if (canManage) return true;

  // Check 2: Is user editing their own scorecard?
  if (userId === targetUserId) {
    // Verify they're a participant
    const participant = await prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    return participant?.role === 'player';
  }

  // Check 3: Are user and target in the same flight?
  const userParticipant = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
    select: { flight: true, role: true },
  });

  const targetParticipant = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId: targetUserId } },
    select: { flight: true },
  });

  // Only players in the same flight can edit each other's scores
  if (
    userParticipant?.role === 'player' &&
    userParticipant?.flight &&
    userParticipant.flight === targetParticipant?.flight
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can view a tournament
 */
export async function canViewTournament(userId: number, tournamentId: number): Promise<boolean> {
  // Check if user is a participant (any role)
  const participant = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  });

  if (participant) return true;

  // Check if user is a club member
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { clubId: true },
  });

  if (!tournament) return false;

  const clubMember = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: tournament.clubId, userId } },
  });

  return !!clubMember;
}

/**
 * Check if user can view tournament leaderboard
 */
export async function canViewLeaderboard(userId: number, tournamentId: number): Promise<boolean> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { leaderboardVisible: true, clubId: true },
  });

  if (!tournament) return false;

  // If leaderboard is publicly visible, anyone can view
  if (tournament.leaderboardVisible) {
    // Still need to be at least a club member
    const clubMember = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: tournament.clubId, userId } },
    });
    return !!clubMember;
  }

  // If not public, only tournament admins and participants can view
  const role = await getUserTournamentRole(userId, tournamentId);
  if (role === 'admin' || role === 'player') return true;

  // Club admins can always view
  return await canManageClub(userId, tournament.clubId);
}

/**
 * Check if user is club owner
 */
export async function isClubOwner(userId: number, clubId: number): Promise<boolean> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { ownerId: true },
  });
  return club?.ownerId === userId;
}

/**
 * Get all clubs where user has a specific role or higher
 */
export async function getUserClubsWithRole(
  userId: number,
  minRole: ClubRole = 'player'
): Promise<number[]> {
  const roleHierarchy: Record<ClubRole, number> = {
    owner: 4,
    admin: 3,
    player: 2,
    spectator: 1,
  };

  const memberships = await prisma.clubMember.findMany({
    where: { userId },
    select: { clubId: true, role: true },
  });

  return memberships
    .filter((m) => roleHierarchy[m.role as ClubRole] >= roleHierarchy[minRole])
    .map((m) => m.clubId);
}
