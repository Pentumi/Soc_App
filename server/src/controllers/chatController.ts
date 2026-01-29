import { Request, Response } from 'express';
import prisma from '../config/database';
import { canManageClub } from '../utils/permissions';

/**
 * Send a chat message
 * POST /api/chat/:entityType/:entityId/messages
 */
export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { entityType, entityId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Validate entityType
    const validTypes = ['club', 'league', 'tournament'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const entityIdNum = parseInt(entityId);

    // Verify user has access to this entity
    if (entityType === 'club') {
      const membership = await prisma.clubMember.findFirst({
        where: {
          clubId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a club member to send messages' });
      }
    } else if (entityType === 'league') {
      const membership = await prisma.leagueMember.findFirst({
        where: {
          leagueId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a league member to send messages' });
      }
    } else if (entityType === 'tournament') {
      const participant = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId: entityIdNum,
          userId,
        },
      });

      if (!participant) {
        return res.status(403).json({ error: 'You must be a tournament participant to send messages' });
      }
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        entityType,
        entityId: entityIdNum,
        userId,
        content: content.trim(),
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
    });

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

/**
 * Get chat messages (paginated)
 * GET /api/chat/:entityType/:entityId/messages?page=1&limit=20
 */
export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { entityType, entityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate entityType
    const validTypes = ['club', 'league', 'tournament'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const entityIdNum = parseInt(entityId);

    // Verify user has access to this entity
    if (entityType === 'club') {
      const membership = await prisma.clubMember.findFirst({
        where: {
          clubId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a club member to view messages' });
      }
    } else if (entityType === 'league') {
      const membership = await prisma.leagueMember.findFirst({
        where: {
          leagueId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a league member to view messages' });
      }
    } else if (entityType === 'tournament') {
      const participant = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId: entityIdNum,
          userId,
        },
      });

      if (!participant) {
        return res.status(403).json({ error: 'You must be a tournament participant to view messages' });
      }
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: {
          entityType,
          entityId: entityIdNum,
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
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({
        where: {
          entityType,
          entityId: entityIdNum,
        },
      }),
    ]);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};

/**
 * Delete a chat message
 * DELETE /api/chat/messages/:messageId
 */
export const deleteMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const messageId = parseInt(req.params.messageId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is message author or entity admin
    let canDelete = message.userId === userId;

    if (!canDelete) {
      // Check if user is admin of the entity
      if (message.entityType === 'club') {
        const membership = await prisma.clubMember.findFirst({
          where: {
            clubId: message.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!membership;
      } else if (message.entityType === 'league') {
        const membership = await prisma.leagueMember.findFirst({
          where: {
            leagueId: message.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!membership;
      } else if (message.entityType === 'tournament') {
        const participant = await prisma.tournamentParticipant.findFirst({
          where: {
            tournamentId: message.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!participant;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete your own messages or must be an admin' });
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message', details: error.message });
  }
};
