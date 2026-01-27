import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);

export default router;
