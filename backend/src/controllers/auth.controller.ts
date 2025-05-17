import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
});

// Generate JWT token
const generateToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const { email, password, name, role } = validation.data;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'EMPLOYEE',
      },
    });

    // Create token
    const token = generateToken(user.id, user.role);

    // Return user data
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = generateToken(user.id, user.role);

    // Return user data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        unavailableDays: true,
        unavailableTimes: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can access user list' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Update a user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update users' });
    }

    const { id } = req.params;

    // Validate request body
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const { name, email, password, role } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // If changing password, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const { id } = req.params;

    // Prevent deleting your own account
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate request body
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// Check if email is approved for registration
export const checkEmailApproved = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email is approved
    const approvedEmail = await prisma.approvedEmail.findUnique({
      where: { email },
    });
    
    // Email is approved if it exists and hasn't been used
    const isApproved = approvedEmail && !approvedEmail.used;
    
    res.json({ isApproved });
  } catch (error) {
    console.error('Check email approval error:', error);
    res.status(500).json({ message: 'Server error checking email approval' });
  }
};

// Employee self-registration
export const selfRegister = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const { email, password, name } = validation.data;

    // Check if email is approved for registration
    const approvedEmail = await prisma.approvedEmail.findUnique({
      where: { email },
    });
    
    if (!approvedEmail) {
      return res.status(403).json({ message: 'Email not approved for registration' });
    }
    
    if (approvedEmail.used) {
      return res.status(403).json({ message: 'This email has already been registered' });
    }

    // Check if email already exists in users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with EMPLOYEE role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'EMPLOYEE',
      },
    });

    // Mark email as used
    await prisma.approvedEmail.update({
      where: { id: approvedEmail.id },
      data: { used: true },
    });

    // Create token
    const token = generateToken(user.id, user.role);

    // Return user data
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Self register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Add approved email (admin only)
export const addApprovedEmail = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can add approved emails' });
    }

    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check if email already exists
    const existing = await prisma.approvedEmail.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ message: 'Email is already in the approved list' });
    }

    // Add email to approved list
    const approvedEmail = await prisma.approvedEmail.create({
      data: { email },
    });

    res.status(201).json(approvedEmail);
  } catch (error) {
    console.error('Add approved email error:', error);
    res.status(500).json({ message: 'Server error adding approved email' });
  }
};

// Get all approved emails (admin only)
export const getApprovedEmails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can view approved emails' });
    }

    const approvedEmails = await prisma.approvedEmail.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(approvedEmails);
  } catch (error) {
    console.error('Get approved emails error:', error);
    res.status(500).json({ message: 'Server error retrieving approved emails' });
  }
};

// Delete approved email (admin only)
export const deleteApprovedEmail = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete approved emails' });
    }

    const { id } = req.params;

    // Check if email exists
    const existing = await prisma.approvedEmail.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Approved email not found' });
    }

    // Delete approved email
    await prisma.approvedEmail.delete({
      where: { id },
    });

    res.json({ message: 'Approved email deleted successfully' });
  } catch (error) {
    console.error('Delete approved email error:', error);
    res.status(500).json({ message: 'Server error deleting approved email' });
  }
}; 