import { Router } from 'express';
import {
  getAllTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
} from '../controllers/tournamentController';
import { getTournamentStats } from '../controllers/statsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllTournaments);
router.get('/:id', authenticate, getTournament);
router.get('/:id/stats', authenticate, getTournamentStats);
router.post('/', authenticate, requireAdmin, createTournament);
router.put('/:id', authenticate, requireAdmin, updateTournament);
router.delete('/:id', authenticate, requireAdmin, deleteTournament);

export default router;
