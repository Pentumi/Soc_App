import express from 'express';
import { authenticate } from '../middleware/auth';
import { getYearStandings } from '../controllers/standingsController';

const router = express.Router();

router.get('/year', authenticate, getYearStandings);

export default router;
