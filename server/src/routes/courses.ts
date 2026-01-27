import { Router } from 'express';
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllCourses);
router.get('/:id', authenticate, getCourse);
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

export default router;
