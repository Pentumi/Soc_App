import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createFlight,
  getFlights,
  updateFlight,
  deleteFlight,
  autoAssignFlights,
  getFlightLeaderboard,
} from '../controllers/flightController';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Flight CRUD - tournament admins only
router.post('/', createFlight);
router.get('/', getFlights);
router.put('/:flightId', updateFlight);
router.delete('/:flightId', deleteFlight);

// Auto-assign players to flights by handicap
router.post('/auto-assign', autoAssignFlights);

// Flight leaderboard
router.get('/:flightId/leaderboard', getFlightLeaderboard);

export default router;
