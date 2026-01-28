import { Router } from 'express';
import {
  createClub,
  getUserClubs,
  getClubDetails,
  updateClubSettings,
  regenerateInviteCode,
  joinClubByCode,
  updateMemberRole,
  removeMember,
  transferOwnership,
} from '../controllers/clubController';
import { authenticate, requireClubRole } from '../middleware/auth';

const router = Router();

// Create a new club
router.post('/', authenticate, createClub);

// Get all clubs user is member of
router.get('/', authenticate, getUserClubs);

// Join club by invite code
router.post('/join', authenticate, joinClubByCode);

// Get club details
router.get('/:clubId', authenticate, getClubDetails);

// Update club settings (admin only)
router.put('/:clubId', authenticate, requireClubRole('admin'), updateClubSettings);

// Regenerate invite code (admin only)
router.post(
  '/:clubId/invite-code/regenerate',
  authenticate,
  requireClubRole('admin'),
  regenerateInviteCode
);

// Update member role (admin only)
router.put(
  '/:clubId/members/:memberId/role',
  authenticate,
  requireClubRole('admin'),
  updateMemberRole
);

// Remove member (admin only)
router.delete(
  '/:clubId/members/:memberId',
  authenticate,
  requireClubRole('admin'),
  removeMember
);

// Transfer ownership (owner only)
router.post(
  '/:clubId/transfer-ownership',
  authenticate,
  requireClubRole('owner'),
  transferOwnership
);

export default router;
