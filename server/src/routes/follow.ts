import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFeed,
  getFollowingStatus,
} from '../controllers/followController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Social feed
router.get('/feed', getFeed);

// Follow/unfollow
router.post('/:userId/follow', followUser);
router.delete('/:userId/unfollow', unfollowUser);

// Get followers/following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/following/status', getFollowingStatus);

export default router;
