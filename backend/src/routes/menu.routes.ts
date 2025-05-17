import { Router } from 'express';
import type { RequestHandler } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menu.controller.js';
import { authenticate, restrictToOwner, allowEitherRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllMenuItems as RequestHandler);
router.get('/:id', getMenuItemById as RequestHandler);

// Protected routes - require authentication and owner role
router.post('/', authenticate as RequestHandler, restrictToOwner as RequestHandler, createMenuItem as RequestHandler);
router.put('/:id', authenticate as RequestHandler, restrictToOwner as RequestHandler, updateMenuItem as RequestHandler);
router.delete('/:id', authenticate as RequestHandler, restrictToOwner as RequestHandler, deleteMenuItem as RequestHandler);

export default router; 