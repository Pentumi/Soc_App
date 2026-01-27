import { Router } from 'express';
import {
  submitTournamentScore,
  getTournamentLeaderboard,
  completeTournament,
  deleteScore,
  getHoleScores,
} from '../controllers/scoreController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateTournamentScore } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, requireAdmin, validateTournamentScore, submitTournamentScore);
router.get('/tournament/:tournamentId', authenticate, getTournamentLeaderboard);
router.post('/tournament/:tournamentId/complete', authenticate, requireAdmin, completeTournament);
router.get('/:scoreId/holes', authenticate, getHoleScores);
router.delete('/:id', authenticate, requireAdmin, deleteScore);

export default router;
