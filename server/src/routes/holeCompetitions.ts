import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createHoleCompetition,
  getHoleCompetitions,
  updateHoleCompetition,
  deleteHoleCompetition,
  setWinner,
  removeWinner,
} from '../controllers/holeCompetitionController';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Hole competition CRUD
router.post('/', createHoleCompetition);
router.get('/', getHoleCompetitions);
router.put('/:competitionId', updateHoleCompetition);
router.delete('/:competitionId', deleteHoleCompetition);

// Winner management
router.post('/:competitionId/winner', setWinner);
router.delete('/:competitionId/winner', removeWinner);

export default router;
