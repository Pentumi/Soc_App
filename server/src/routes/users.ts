import { Router } from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllMembers);
router.get('/:id', authenticate, getMember);
router.post('/', authenticate, requireAdmin, createMember);
router.put('/:id', authenticate, requireAdmin, updateMember);
router.delete('/:id', authenticate, requireAdmin, deleteMember);

export default router;
