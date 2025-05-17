import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
}); 