import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createGame,
  getGames,
  updateGame,
  deleteGame,
  getGameResults,
} from '../controllers/gameController';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Game CRUD
router.post('/', createGame);
router.get('/', getGames);
router.put('/:gameId', updateGame);
router.delete('/:gameId', deleteGame);

// Game results
router.get('/:gameId/results', getGameResults);

export default router;
