import { Router } from 'express';
import {
  getHandicapHistory,
  manualHandicapAdjustment,
} from '../controllers/handicapController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/user/:userId', authenticate, getHandicapHistory);
router.post('/user/:userId/adjust', authenticate, requireAdmin, manualHandicapAdjustment);

export default router;
