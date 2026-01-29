import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from '../controllers/chatController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Chat messages
router.post('/:entityType/:entityId/messages', sendMessage);
router.get('/:entityType/:entityId/messages', getMessages);
router.delete('/messages/:messageId', deleteMessage);

export default router;
