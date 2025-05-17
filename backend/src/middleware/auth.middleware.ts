import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// Verify JWT token middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id: string;
      role: string;
    };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid authorization token' });
  }
};

// Restrict to admin role
export const restrictToAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin role required' });
  }

  next();
};

// Allow both admin and employee roles
export const allowEitherRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Access denied. Invalid role' });
  }

  next();
}; 