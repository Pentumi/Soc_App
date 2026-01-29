import { Request, Response } from 'express';
import prisma from '../config/database';
import path from 'path';
import fs from 'fs';

/**
 * Upload a photo
 * POST /api/photos/:entityType/:entityId
 * Note: Requires multer middleware for file upload
 */
export const uploadPhoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { entityType, entityId } = req.params;
    const { caption } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    // Validate entityType
    const validTypes = ['club', 'league', 'tournament', 'user'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const entityIdNum = parseInt(entityId);

    // Verify user has access to upload to this entity
    if (entityType === 'club') {
      const membership = await prisma.clubMember.findFirst({
        where: {
          clubId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a club member to upload photos' });
      }
    } else if (entityType === 'league') {
      const membership = await prisma.leagueMember.findFirst({
        where: {
          leagueId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a league member to upload photos' });
      }
    } else if (entityType === 'tournament') {
      const participant = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId: entityIdNum,
          userId,
        },
      });

      if (!participant) {
        return res.status(403).json({ error: 'You must be a tournament participant to upload photos' });
      }
    } else if (entityType === 'user') {
      // Users can only upload to their own profile
      if (entityIdNum !== userId) {
        return res.status(403).json({ error: 'You can only upload photos to your own profile' });
      }
    }

    // File path will be set by multer middleware
    // URL should be relative path for serving via Express static
    const photoUrl = `/uploads/photos/${file.filename}`;

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        entityType,
        entityId: entityIdNum,
        userId,
        url: photoUrl,
        caption: caption || null,
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

    res.status(201).json(photo);
  } catch (error: any) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo', details: error.message });
  }
};

/**
 * Get photos for an entity
 * GET /api/photos/:entityType/:entityId?page=1&limit=20
 */
export const getPhotos = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { entityType, entityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate entityType
    const validTypes = ['club', 'league', 'tournament', 'user'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const entityIdNum = parseInt(entityId);

    // Verify user has access to view photos
    if (entityType === 'club') {
      const membership = await prisma.clubMember.findFirst({
        where: {
          clubId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a club member to view photos' });
      }
    } else if (entityType === 'league') {
      const membership = await prisma.leagueMember.findFirst({
        where: {
          leagueId: entityIdNum,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a league member to view photos' });
      }
    } else if (entityType === 'tournament') {
      const participant = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId: entityIdNum,
          userId,
        },
      });

      if (!participant) {
        return res.status(403).json({ error: 'You must be a tournament participant to view photos' });
      }
    }
    // Note: user photos are public (no access check)

    // Get photos with pagination
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
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
      prisma.photo.count({
        where: {
          entityType,
          entityId: entityIdNum,
        },
      }),
    ]);

    res.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + photos.length < total,
      },
    });
  } catch (error: any) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
};

/**
 * Delete a photo
 * DELETE /api/photos/:photoId
 */
export const deletePhoto = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const photoId = parseInt(req.params.photoId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if user is photo uploader or entity admin
    let canDelete = photo.userId === userId;

    if (!canDelete) {
      // Check if user is admin of the entity
      if (photo.entityType === 'club') {
        const membership = await prisma.clubMember.findFirst({
          where: {
            clubId: photo.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!membership;
      } else if (photo.entityType === 'league') {
        const membership = await prisma.leagueMember.findFirst({
          where: {
            leagueId: photo.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!membership;
      } else if (photo.entityType === 'tournament') {
        const participant = await prisma.tournamentParticipant.findFirst({
          where: {
            tournamentId: photo.entityId,
            userId,
            role: { in: ['owner', 'admin'] },
          },
        });
        canDelete = !!participant;
      } else if (photo.entityType === 'user') {
        // Only the user themselves can delete their profile photos
        canDelete = photo.entityId === userId;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete your own photos or must be an admin' });
    }

    // Delete file from disk if it exists
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/photos');
      const filename = path.basename(photo.url);
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting photo file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete photo record
    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo', details: error.message });
  }
};
