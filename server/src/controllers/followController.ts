import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Follow a user
 * POST /api/users/:userId/follow
 */
export const followUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            currentHandicap: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `You are now following ${userToFollow.firstName} ${userToFollow.lastName}`,
      follow,
    });
  } catch (error: any) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user', details: error.message });
  }
};

/**
 * Unfollow a user
 * DELETE /api/users/:userId/unfollow
 */
export const unfollowUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if following relationship exists
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'You are not following this user' });
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error: any) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user', details: error.message });
  }
};

/**
 * Get followers of a user
 * GET /api/users/:userId/followers?page=1&limit=20
 */
export const getFollowers = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
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
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: {
          followingId: userId,
        },
      }),
    ]);

    res.json({
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + followers.length < total,
      },
    });
  } catch (error: any) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to fetch followers', details: error.message });
  }
};

/**
 * Get users that a user is following
 * GET /api/users/:userId/following?page=1&limit=20
 */
export const getFollowing = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: {
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
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.follow.count({
        where: {
          followerId: userId,
        },
      }),
    ]);

    res.json({
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + following.length < total,
      },
    });
  } catch (error: any) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following', details: error.message });
  }
};

/**
 * Get activity feed from followed users
 * GET /api/social/feed?page=1&limit=20
 */
export const getFeed = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get list of users being followed
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return res.json({
        activities: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });
    }

    const skip = (page - 1) * limit;

    // Get recent tournament scores from followed users
    const recentScores = await prisma.tournamentScore.findMany({
      where: {
        participant: {
          userId: { in: followingIds },
        },
      },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
            tournament: {
              select: {
                id: true,
                name: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get recent photos from followed users
    const recentPhotos = await prisma.photo.findMany({
      where: {
        userId: { in: followingIds },
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Combine and sort activities
    const activities: any[] = [];

    // Add score activities
    recentScores.forEach((score) => {
      activities.push({
        type: 'score',
        timestamp: score.createdAt,
        user: score.participant.user,
        data: {
          tournament: score.participant.tournament,
          grossScore: score.grossScore,
          netScore: score.netScore,
        },
      });
    });

    // Add photo activities
    recentPhotos.forEach((photo) => {
      activities.push({
        type: 'photo',
        timestamp: photo.createdAt,
        user: photo.user,
        data: {
          photoId: photo.id,
          photoUrl: photo.url,
          caption: photo.caption,
          entityType: photo.entityType,
          entityId: photo.entityId,
        },
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Paginate combined results
    const paginatedActivities = activities.slice(0, limit);

    res.json({
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: activities.length,
        totalPages: Math.ceil(activities.length / limit),
        hasMore: activities.length > limit,
      },
    });
  } catch (error: any) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed', details: error.message });
  }
};

/**
 * Check if current user is following another user
 * GET /api/users/:userId/following/status
 */
export const getFollowingStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.json({
      isFollowing: !!follow,
      followSince: follow?.createdAt || null,
    });
  } catch (error: any) {
    console.error('Get following status error:', error);
    res.status(500).json({ error: 'Failed to check following status', details: error.message });
  }
};
