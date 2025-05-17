import { Router } from 'express';
import orderRoutes from './order.routes.js';
import authRoutes from './auth.routes.js';
import scheduleRoutes from './schedule.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/schedules', scheduleRoutes);

export default router; 