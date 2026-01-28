import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserScorecard,
  getFlightScorecards,
  getTournamentFlights,
} from '../controllers/scorecardController';

const router = express.Router();

// Get all flights for a tournament
router.get('/tournaments/:tournamentId/flights', authenticate, getTournamentFlights);

// Get all scorecards for a flight
router.get('/tournaments/:tournamentId/flights/:flight', authenticate, getFlightScorecards);

// Get a specific user's scorecard
router.get('/tournaments/:tournamentId/users/:userId', authenticate, getUserScorecard);

export default router;
