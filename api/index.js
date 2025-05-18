import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import your backend routes - adjust paths as needed
import userRoutes from '../backend/src/routes/userRoutes.js';
import menuRoutes from '../backend/src/routes/menuRoutes.js';
import orderRoutes from '../backend/src/routes/orderRoutes.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const server = createServer(app);
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app; 