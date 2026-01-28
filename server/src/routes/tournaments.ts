import { Router } from 'express';
import {
  getAllTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  joinTournament,
  updateParticipant,
  removeParticipant,
  joinByInviteCode,
} from '../controllers/tournamentController';
import { getTournamentStats } from '../controllers/statsController';
import { authenticate, requireTournamentRole } from '../middleware/auth';

const router = Router();

// Tournament CRUD
router.get('/', authenticate, getAllTournaments);
router.get('/:id', authenticate, getTournament);
router.get('/:id/stats', authenticate, getTournamentStats);
router.post('/', authenticate, createTournament);
router.put('/:id', authenticate, requireTournamentRole('admin'), updateTournament);
router.delete('/:id', authenticate, requireTournamentRole('admin'), deleteTournament);

// Participant management
router.post('/join-by-code', authenticate, joinByInviteCode);
router.post('/:id/join', authenticate, joinTournament);
router.put(
  '/:id/participants/:userId',
  authenticate,
  requireTournamentRole('admin'),
  updateParticipant
);
router.delete(
  '/:id/participants/:userId',
  authenticate,
  requireTournamentRole('admin'),
  removeParticipant
);

export default router;
