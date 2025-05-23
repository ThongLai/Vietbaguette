import express from 'express';
import { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const PORT = process.env.PORT as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const CORS_ORIGIN = process.env.CORS_ORIGIN as string;
const FRONTEND_URL_LOCAL = process.env.FRONTEND_URL_LOCAL as string;

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: [CORS_ORIGIN, FRONTEND_URL, FRONTEND_URL_LOCAL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [CORS_ORIGIN, FRONTEND_URL, FRONTEND_URL_LOCAL],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected, socket id: ', socket.id);

  // Handle order updates
  socket.on('newOrder', (orderData) => {
    console.log('New order received:', orderData);
    // Broadcast to all connected clients
    io.emit('orderUpdate', { type: 'new', order: orderData });
  });

  // Handle order status updates
  socket.on('updateOrderStatus', (data) => {
    console.log('Order status update:', data);
    io.emit('orderUpdate', { type: 'status', data });
  });

  // Handle voice communication
  socket.on('voiceCommunication', (data) => {
    // Broadcast voice data to all other clients
    socket.broadcast.emit('voiceMessage', {
      from: data.from,
      audio: data.audio
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// API routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Viet Baguette API Server' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the server
});

export { io }; 