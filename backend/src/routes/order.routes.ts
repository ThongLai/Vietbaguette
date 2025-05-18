import { Router } from 'express';
import type { RequestHandler } from 'express';
import { 
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  updateOrderUrgency,
  updateOrderItemQuantity,
  deleteOrder
} from '../controllers/order.controller.js';
import { authenticate, allowEitherRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes - require authentication
router.use(authenticate as RequestHandler);

// GET all orders
router.get('/', allowEitherRole as RequestHandler, getAllOrders as RequestHandler);

// GET a single order by ID
router.get('/:id', allowEitherRole as RequestHandler, getOrderById as RequestHandler);

// POST a new order
router.post('/', allowEitherRole as RequestHandler, createOrder as RequestHandler);

// PATCH an order status
router.patch('/:id/status', allowEitherRole as RequestHandler, updateOrderStatus as RequestHandler);

// PATCH an order item status
router.patch('/:orderId/items/:itemId/status', allowEitherRole as RequestHandler, updateOrderItemStatus as RequestHandler);

// PATCH an order item quantity
router.patch('/:orderId/items/:itemId/quantity', allowEitherRole as RequestHandler, updateOrderItemQuantity as RequestHandler);

// PATCH an order to mark as urgent
router.patch('/:id/priority', allowEitherRole as RequestHandler, updateOrderUrgency as RequestHandler);

// DELETE an order
router.delete('/:id', allowEitherRole as RequestHandler, deleteOrder as RequestHandler);

export default router; 