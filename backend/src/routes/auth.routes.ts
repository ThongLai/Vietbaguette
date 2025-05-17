import { Router } from 'express';
import type { RequestHandler } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword 
} from '../controllers/auth.controller.js';
import { authenticate, restrictToOwner } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);

// Protected routes
router.get('/me', authenticate as RequestHandler, getCurrentUser as RequestHandler);
router.put('/profile', authenticate as RequestHandler, updateProfile as RequestHandler);
router.put('/change-password', authenticate as RequestHandler, changePassword as RequestHandler);

export default router; 