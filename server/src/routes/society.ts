import express from 'express';
import { authenticate } from '../middleware/auth';
import { createSociety, getSociety, updateSociety } from '../controllers/societyController';

const router = express.Router();

router.post('/', authenticate, createSociety);
router.get('/', authenticate, getSociety);
router.put('/', authenticate, updateSociety);

export default router;
