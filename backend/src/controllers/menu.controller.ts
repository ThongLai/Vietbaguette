import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// Validation schemas
const optionChoiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  price: z.number().optional(),
});

const menuOptionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  choices: z.array(optionChoiceSchema),
});

const menuItemSchema = z.object({
  name: z.string().min(1),
  nameVi: z.string().optional(),
  price: z.number().positive(),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.string().min(1),
  vegetarian: z.boolean().optional(),
  options: z.array(menuOptionSchema).optional(),
});

const updateMenuItemSchema = menuItemSchema.partial();

// Get all menu items
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const where = category ? { category: category as string } : undefined;
    
    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
      orderBy: {
        category: 'asc',
      },
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Get all menu items error:', error);
    res.status(500).json({ message: 'Server error fetching menu items' });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Get menu item by ID error:', error);
    res.status(500).json({ message: 'Server error fetching menu item' });
  }
};

// Create menu item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can create menu items' });
    }
    
    // Validate request body
    const validation = menuItemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const {
      name,
      nameVi,
      price,
      description,
      image,
      category,
      vegetarian,
      options,
    } = validation.data;
    
    // Create the menu item with options in a transaction
    const menuItem = await prisma.$transaction(async (tx: PrismaClient) => {
      const newMenuItem = await tx.menuItem.create({
        data: {
          name,
          nameVi,
          price,
          description,
          image,
          category,
          vegetarian: vegetarian ?? false,
        },
      });

      // Create options and choices if provided
      if (options && options.length > 0) {
        for (const option of options) {
          await tx.menuOption.create({
            data: {
              name: option.name,
              menuItemId: newMenuItem.id,
              choices: {
                create: option.choices.map((choice) => ({
                  name: choice.name,
                  price: choice.price,
                })),
              },
            },
          });
        }
      }
      
      // Return the created menu item with all relations
      return tx.menuItem.findUnique({
        where: { id: newMenuItem.id },
        include: {
          options: {
            include: {
              choices: true,
            },
          },
        },
      });
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Server error creating menu item' });
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can update menu items' });
    }
    
    const { id } = req.params;
    
    // Validate request body
    const validation = updateMenuItemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const {
      name,
      nameVi,
      price,
      description,
      image,
      category,
      vegetarian,
      options,
    } = validation.data;
    
    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
    });
    
    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Update the menu item with options in a transaction
    const menuItem = await prisma.$transaction(async (tx: PrismaClient) => {
      // Update basic menu item data
      const updatedMenuItem = await tx.menuItem.update({
        where: { id },
        data: {
          name: name ?? existingMenuItem.name,
          nameVi: nameVi !== undefined ? nameVi : existingMenuItem.nameVi,
          price: price ?? existingMenuItem.price,
          description: description !== undefined ? description : existingMenuItem.description,
          image: image !== undefined ? image : existingMenuItem.image,
          category: category ?? existingMenuItem.category,
          vegetarian: vegetarian !== undefined ? vegetarian : existingMenuItem.vegetarian,
        },
      });
      
      // If options are provided, update them
      if (options) {
        // Delete existing options and create new ones
        if (existingMenuItem.options.length > 0) {
          await tx.menuOption.deleteMany({
            where: { menuItemId: id },
          });
        }
        
        // Create new options
        for (const option of options) {
          await tx.menuOption.create({
            data: {
              name: option.name,
              menuItemId: id,
              choices: {
                create: option.choices.map((choice) => ({
                  name: choice.name,
                  price: choice.price,
                })),
              },
            },
          });
        }
      }
      
      // Return the updated menu item with all relations
      return tx.menuItem.findUnique({
        where: { id },
        include: {
          options: {
            include: {
              choices: true,
            },
          },
        },
      });
    });
    
    res.json(menuItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error updating menu item' });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can delete menu items' });
    }
    
    const { id } = req.params;
    
    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });
    
    if (!existingMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Delete menu item
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Delete associated options and choices first
      await tx.menuOption.deleteMany({
        where: { menuItemId: id },
      });
      
      // Delete the menu item
      await tx.menuItem.delete({
        where: { id },
      });
    });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error deleting menu item' });
  }
}; 