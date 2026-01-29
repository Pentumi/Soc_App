import express from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  uploadPhoto,
  getPhotos,
  deletePhoto,
} from '../controllers/photoController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Photo routes
router.post('/:entityType/:entityId', upload.single('photo'), uploadPhoto);
router.get('/:entityType/:entityId', getPhotos);
router.delete('/:photoId', deletePhoto);

export default router;
