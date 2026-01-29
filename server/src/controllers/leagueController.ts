import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageClub } from '../utils/permissions';

/**
 * Create a new league within a club
 * POST /api/leagues
 */
export const createLeague = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      clubId,
      name,
      description,
      photoUrl,
      seasonName,
      seasonStart,
      seasonEnd,
      scoringFormat,
      pointsSystem,
      settings,
    } = req.body;

    if (!clubId || !name) {
      return res.status(400).json({ error: 'clubId and name are required' });
    }

    // Verify user has permission to create league (club admin/owner)
    const canManage = await canManageClub(userId, clubId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only club admins can create leagues' });
    }

    const league = await prisma.league.create({
      data: {
        clubId,
        name,
        description,
        photoUrl,
        seasonName,
        seasonStart: seasonStart ? new Date(seasonStart) : null,
        seasonEnd: seasonEnd ? new Date(seasonEnd) : null,
        scoringFormat: scoringFormat || 'stableford',
        pointsSystem: pointsSystem || { win: 10, second: 7, third: 5, participation: 1 },
        settings: settings || { selfRegistration: true, notifications: true },
        createdById: userId,
      },
      include: {
        club: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Automatically add creator as owner
    await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        role: 'owner',
      },
    });

    res.status(201).json(league);
  } catch (error: any) {
    console.error('Create league error:', error);
    res.status(500).json({ error: 'Failed to create league', details: error.message });
  }
};

/**
 * Get all leagues the user is a member of
 * GET /api/leagues
 */
export const getUserLeagues = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const leagues = await prisma.leagueMember.findMany({
      where: { userId },
      include: {
        league: {
          include: {
            club: true,
            _count: {
              select: {
                members: true,
                tournaments: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    // Transform to include user's role
    const leaguesWithRole = leagues.map((membership) => ({
      ...membership.league,
      userRole: membership.role,
      seasonPoints: membership.seasonPoints,
      eventsPlayed: membership.eventsPlayed,
      joinedAt: membership.joinedAt,
    }));

    res.json(leaguesWithRole);
  } catch (error: any) {
    console.error('Get user leagues error:', error);
    res.status(500).json({ error: 'Failed to fetch leagues', details: error.message });
  }
};

/**
 * Get league details with members and tournaments
 * GET /api/leagues/:id
 */
export const getLeagueDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a member
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a league member' });
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        club: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                currentHandicap: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: [
            { seasonPoints: 'desc' },
            { joinedAt: 'asc' },
          ],
        },
        tournaments: {
          include: {
            course: true,
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            tournamentDate: 'desc',
          },
        },
      },
    });

    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Add user's role to response
    const leagueWithRole = {
      ...league,
      userRole: membership.role,
    };

    res.json(leagueWithRole);
  } catch (error: any) {
    console.error('Get league details error:', error);
    res.status(500).json({ error: 'Failed to fetch league', details: error.message });
  }
};

/**
 * Update league settings
 * PUT /api/leagues/:id
 */
export const updateLeague = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is owner or admin
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: 'Only league admins can update league settings' });
    }

    const {
      name,
      description,
      photoUrl,
      seasonName,
      seasonStart,
      seasonEnd,
      scoringFormat,
      pointsSystem,
      settings,
    } = req.body;

    const league = await prisma.league.update({
      where: { id: leagueId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(seasonName !== undefined && { seasonName }),
        ...(seasonStart && { seasonStart: new Date(seasonStart) }),
        ...(seasonEnd && { seasonEnd: new Date(seasonEnd) }),
        ...(scoringFormat && { scoringFormat }),
        ...(pointsSystem && { pointsSystem }),
        ...(settings && { settings }),
      },
      include: {
        club: true,
        _count: {
          select: {
            members: true,
            tournaments: true,
          },
        },
      },
    });

    res.json(league);
  } catch (error: any) {
    console.error('Update league error:', error);
    res.status(500).json({ error: 'Failed to update league', details: error.message });
  }
};

/**
 * Delete a league
 * DELETE /api/leagues/:id
 */
export const deleteLeague = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is owner
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only league owner can delete league' });
    }

    await prisma.league.delete({
      where: { id: leagueId },
    });

    res.json({ success: true, message: 'League deleted successfully' });
  } catch (error: any) {
    console.error('Delete league error:', error);
    res.status(500).json({ error: 'Failed to delete league', details: error.message });
  }
};

/**
 * Join a league by invite code
 * POST /api/leagues/join
 */
export const joinLeagueByCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { inviteCode } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    // Find league by invite code
    const league = await prisma.league.findUnique({
      where: { inviteCode },
      include: {
        club: true,
      },
    });

    if (!league) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already a member
    const existingMember = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId: league.id,
          userId,
        },
      },
    });

    if (existingMember) {
      return res.json({
        alreadyMember: true,
        league,
        membership: existingMember,
      });
    }

    // Check league settings for self-registration
    const settings = league.settings as any;
    const defaultRole = settings?.selfRegistration ? 'player' : 'spectator';

    // Create membership
    const membership = await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        role: defaultRole,
      },
    });

    res.status(201).json({
      league,
      membership,
      message: `Joined as ${defaultRole}`,
    });
  } catch (error: any) {
    console.error('Join league error:', error);
    res.status(500).json({ error: 'Failed to join league', details: error.message });
  }
};

/**
 * Regenerate league invite code
 * POST /api/leagues/:id/invite-code/regenerate
 */
export const regenerateInviteCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is owner or admin
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: 'Only league admins can regenerate invite codes' });
    }

    const { v4: uuidv4 } = require('uuid');
    const newInviteCode = uuidv4();

    const league = await prisma.league.update({
      where: { id: leagueId },
      data: { inviteCode: newInviteCode },
    });

    res.json({ inviteCode: league.inviteCode });
  } catch (error: any) {
    console.error('Regenerate invite code error:', error);
    res.status(500).json({ error: 'Failed to regenerate invite code', details: error.message });
  }
};

/**
 * Get league season standings
 * GET /api/leagues/:id/standings
 */
export const getLeagueStandings = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a member
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a league member' });
    }

    // Get all league members with their points
    const standings = await prisma.leagueMember.findMany({
      where: { leagueId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentHandicap: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: [
        { seasonPoints: 'desc' },
        { eventsPlayed: 'asc' },
      ],
    });

    // Add position
    const standingsWithPosition = standings.map((standing, index) => ({
      position: index + 1,
      ...standing,
    }));

    res.json(standingsWithPosition);
  } catch (error: any) {
    console.error('Get league standings error:', error);
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
};

/**
 * Update league member role
 * PUT /api/leagues/:id/members/:memberId/role
 */
export const updateMemberRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);
    const { role } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!role || !['owner', 'admin', 'player', 'spectator'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' });
    }

    // Check if requester is owner or admin
    const requesterMembership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!requesterMembership || (requesterMembership.role !== 'owner' && requesterMembership.role !== 'admin')) {
      return res.status(403).json({ error: 'Only league admins can update member roles' });
    }

    // Prevent non-owners from creating/removing owners
    if (role === 'owner' && requesterMembership.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can assign owner role' });
    }

    const updatedMembership = await prisma.leagueMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedMembership);
  } catch (error: any) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role', details: error.message });
  }
};

/**
 * Remove member from league
 * DELETE /api/leagues/:id/members/:memberId
 */
export const removeMember = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const leagueId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if requester is owner or admin
    const requesterMembership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    if (!requesterMembership || (requesterMembership.role !== 'owner' && requesterMembership.role !== 'admin')) {
      return res.status(403).json({ error: 'Only league admins can remove members' });
    }

    // Get the member to be removed
    const memberToRemove = await prisma.leagueMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.leagueId !== leagueId) {
      return res.status(404).json({ error: 'Member not found in this league' });
    }

    // Prevent removing the owner
    if (memberToRemove.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove league owner' });
    }

    await prisma.leagueMember.delete({
      where: { id: memberId },
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member', details: error.message });
  }
};
