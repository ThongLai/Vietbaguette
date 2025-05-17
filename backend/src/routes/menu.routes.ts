import { Router } from 'express';
import type { RequestHandler } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menu.controller.js';
import { authenticate, restrictToAdmin, allowEitherRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllMenuItems as RequestHandler);
router.get('/:id', getMenuItemById as RequestHandler);

// Protected routes - require authentication and admin role
router.post('/', authenticate as RequestHandler, restrictToAdmin as RequestHandler, createMenuItem as RequestHandler);
router.put('/:id', authenticate as RequestHandler, restrictToAdmin as RequestHandler, updateMenuItem as RequestHandler);
router.delete('/:id', authenticate as RequestHandler, restrictToAdmin as RequestHandler, deleteMenuItem as RequestHandler);

export default router; 