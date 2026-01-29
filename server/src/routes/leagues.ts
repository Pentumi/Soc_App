import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createLeague,
  getUserLeagues,
  getLeagueDetails,
  updateLeague,
  deleteLeague,
  joinLeagueByCode,
  regenerateInviteCode,
  getLeagueStandings,
  updateMemberRole,
  removeMember,
} from '../controllers/leagueController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// League CRUD
router.post('/', createLeague);
router.get('/', getUserLeagues);
router.get('/:id', getLeagueDetails);
router.put('/:id', updateLeague);
router.delete('/:id', deleteLeague);

// Join by invite code
router.post('/join', joinLeagueByCode);

// Invite code management
router.post('/:id/invite-code/regenerate', regenerateInviteCode);

// Standings
router.get('/:id/standings', getLeagueStandings);

// Member management
router.put('/:id/members/:memberId/role', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

export default router;
