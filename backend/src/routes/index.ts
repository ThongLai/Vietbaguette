import { Router } from 'express';
import orderRoutes from './order.routes';
import authRoutes from './auth.routes';
import scheduleRoutes from './schedule.routes';
import menuRoutes from './menu.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/menu', menuRoutes);

export default router; 