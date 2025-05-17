import { Router } from 'express';
import { 
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  updateOrderPriority
} from '../controllers/order.controller';
import { authenticate, allowEitherRole } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// GET all orders
router.get('/', allowEitherRole, getAllOrders);

// GET a single order by ID
router.get('/:id', allowEitherRole, getOrderById);

// POST a new order
router.post('/', allowEitherRole, createOrder);

// PATCH an order status
router.patch('/:id/status', allowEitherRole, updateOrderStatus);

// PATCH an order item status
router.patch('/:orderId/items/:itemId/status', allowEitherRole, updateOrderItemStatus);

// PATCH an order to mark urgent or VIP
router.patch('/:id/priority', allowEitherRole, updateOrderPriority);

export default router; 