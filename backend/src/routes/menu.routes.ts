import { Router } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menu.controller';
import { authenticate, restrictToOwner, allowEitherRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Protected routes - require authentication and owner role
router.post('/', authenticate, restrictToOwner, createMenuItem);
router.put('/:id', authenticate, restrictToOwner, updateMenuItem);
router.delete('/:id', authenticate, restrictToOwner, deleteMenuItem);

export default router; 