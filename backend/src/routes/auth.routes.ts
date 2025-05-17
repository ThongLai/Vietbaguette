import { Router } from 'express';
import type { RequestHandler } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser,
  checkEmailApproved,
  selfRegister,
  addApprovedEmail,
  getApprovedEmails,
  deleteApprovedEmail
} from '../controllers/auth.controller.js';
import { authenticate, restrictToAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);

// Self-registration routes
router.post('/check-email', checkEmailApproved as RequestHandler);
router.post('/self-register', selfRegister as RequestHandler);

// Protected routes
router.get('/me', authenticate as RequestHandler, getCurrentUser as RequestHandler);
router.put('/profile', authenticate as RequestHandler, updateProfile as RequestHandler);
router.put('/change-password', authenticate as RequestHandler, changePassword as RequestHandler);

// Admin routes
router.get('/users', authenticate as RequestHandler, restrictToAdmin as RequestHandler, getAllUsers as RequestHandler);
router.put('/users/:id', authenticate as RequestHandler, restrictToAdmin as RequestHandler, updateUser as RequestHandler);
router.delete('/users/:id', authenticate as RequestHandler, restrictToAdmin as RequestHandler, deleteUser as RequestHandler);

// Approved email routes (admin only)
router.get('/approved-emails', authenticate as RequestHandler, restrictToAdmin as RequestHandler, getApprovedEmails as RequestHandler);
router.post('/approved-emails', authenticate as RequestHandler, restrictToAdmin as RequestHandler, addApprovedEmail as RequestHandler);
router.delete('/approved-emails/:id', authenticate as RequestHandler, restrictToAdmin as RequestHandler, deleteApprovedEmail as RequestHandler);

export default router; 