import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  assignPlayers,
  removePlayer,
  getTeamStats,
} from '../controllers/teamController';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Team CRUD - tournament admins only
router.post('/', createTeam);
router.get('/', getTeams);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);

// Player assignment
router.post('/:teamId/assign', assignPlayers);
router.delete('/:teamId/players/:playerId', removePlayer);

// Team stats
router.get('/:teamId/stats', getTeamStats);

export default router;
