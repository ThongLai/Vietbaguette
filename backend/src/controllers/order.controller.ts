import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { PrismaClient, Prisma, OrderStatus, OrderItemStatus } from '@prisma/client';

// Validation schemas
const selectedOptionSchema = z.object({
  menuOptionId: z.string().uuid(),
  optionChoiceId: z.string().uuid(),
  extraPrice: z.number().optional(),
});

const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  selectedOptions: z.array(selectedOptionSchema).optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  tableNumber: z.number().int().optional(),
  customerName: z.string().optional(),
  isUrgent: z.boolean().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

const updateOrderItemStatusSchema = z.object({
  status: z.enum(['PREPARING', 'COMPLETED', 'CANCELLED']),
});

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    // Base query
    const where: any = {};
    
    // Filter by status if provided
    if (status && ['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status as string)) {
      where.status = status;
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true,
            selectedOptions: {
              include: {
                menuOption: true,
                optionChoice: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
            selectedOptions: {
              include: {
                menuOption: true,
                optionChoice: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate request body
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const { items, tableNumber, customerName, isUrgent } = validation.data;
    
    // Calculate order total
    let total = 0;
    // Initialize the processedItems array
    const processedItems: any[] = [];
    
    // Create the order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // First get all the menuItems to calculate the total
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: {
          id: {
            in: menuItemIds,
          },
        },
        include: {
          options: {
            include: {
              choices: true,
            },
          },
        },
      });
      // Process each item
      for (const item of items) {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        
        if (!menuItem) {
          return res.status(400).json({ message: `Menu item with ID ${item.menuItemId} not found` });
        }
        
        // Calculate base price for this item
        let itemTotal = menuItem.price * item.quantity;
      
      // Create item with options if provided
      const processedItem: any = {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes,
      };
      // Process options if provided
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        processedItem.selectedOptions = {
          create: [],
        };
        for (const option of item.selectedOptions) {
          const menuOption = await tx.menuOption.findUnique({
            where: { id: option.menuOptionId },
            include: {
              choices: true,
            },
          });
          
          if (!menuOption) {
            return res.status(400).json({ message: `Menu option with ID ${option.menuOptionId} not found` });
          }
          
          const optionChoice = await tx.optionChoice.findUnique({
            where: { id: option.optionChoiceId },
          });
          
          if (!optionChoice) {
            return res.status(400).json({ message: `Option choice with ID ${option.optionChoiceId} not found` });
          }
          
          // Add option price if it exists
          if (optionChoice.price) {
            itemTotal += optionChoice.price * item.quantity;
          }
          
          processedItem.selectedOptions.create.push({
            menuOptionId: option.menuOptionId,
            optionChoiceId: option.optionChoiceId,
            extraPrice: optionChoice.price,
          });
        }
      }
      
      // Add item total to order total
      total += itemTotal;
      
      processedItems.push(processedItem);
    }
    
    // Create order in a transaction
    const createdOrder = await tx.order.create({
      data: {
        total,
        tableNumber,
        customerName,
        isUrgent: isUrgent ?? false,
        createdById: req.user!.id,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
            selectedOptions: {
              include: {
                menuOption: true,
                optionChoice: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Create notifications for all users
    const users = await tx.user.findMany({
      select: { id: true },
    });
    
    // Create notifications
    await Promise.all(
      users.map((user: any) => 
        tx.notification.create({
          data: {
            type: 'NEW_ORDER',
            content: `New order #${createdOrder.id.substring(0, 8)} created`,
            orderId: createdOrder.id,
            userId: user.id,
          }
        })
      )
    );
    
    return createdOrder;
  });
  
  res.status(201).json(order);
} catch (error) {
  console.error('Create order error:', error);
  res.status(500).json({ message: 'Server error creating order' });
}
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    // Validate request body
    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const { status } = validation.data as { status: OrderStatus };
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status in a transaction
    let updatedOrder;
    
    try {
      // First update the order
      updatedOrder = await prisma.$transaction(async (prismaTransaction) => {
        // Update the order
        const updatedOrder = await prismaTransaction.order.update({
          where: { id },
          data: { status },
          include: {
            items: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        
        // If status is COMPLETED or CANCELLED, update all items to match
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          await prismaTransaction.orderItem.updateMany({
            where: { orderId: id },
            data: { status },
          });
        }
        
        // Get all users for notifications
        const users = await prismaTransaction.user.findMany({
          select: { id: true },
        });
        
        // Create notifications
        await Promise.all(
          users.map((user: any) => 
            prismaTransaction.notification.create({
              data: {
                type: 'ORDER_UPDATED',
                content: `Order #${id.substring(0, 8)} status updated to ${status}`,
                orderId: id,
                userId: user.id,
              }
            })
          )
        );
        
        return updatedOrder;
      });
    } catch (err) {
      console.error('Transaction error:', err);
      throw new Error('Failed to update order status');
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// Update order item status
export const updateOrderItemStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { orderId, itemId } = req.params;
    
    // Validate request body
    const validation = updateOrderItemStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const { status } = validation.data as { status: OrderItemStatus };
    
    // Check if order and item exist
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId,
      },
      include: {
        menuItem: true,
      },
    });
    
    if (!existingItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }
    
    // Update item status
    const result = await prisma.$transaction(async (prismaTransaction) => {
      // Update the item
      const updatedItem = await prismaTransaction.orderItem.update({
        where: { id: itemId },
        data: { status },
        include: {
          menuItem: true,
          selectedOptions: {
            include: {
              menuOption: true,
              optionChoice: true,
            },
          },
        },
      });
      
      // Check if all items are completed or cancelled to update the order status
      const allItems = await prismaTransaction.orderItem.findMany({
        where: {
          orderId,
        },
      });
      
      let orderStatus: OrderStatus = 'ACTIVE';
      
      // If ALL items are cancelled, mark the order as cancelled
      if (allItems.every(item => item.status === 'CANCELLED')) {
        orderStatus = 'CANCELLED';
      }
      // If ALL items are completed, mark the order as completed 
      else if (allItems.every(item => item.status === 'COMPLETED')) {
        orderStatus = 'COMPLETED';
      }
      // Otherwise, keep it as active
      else {
        orderStatus = 'ACTIVE';
      }
      
      // Update the order status
      const updatedOrder = await prismaTransaction.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      });
      
      // Create notifications for all users
      const users = await prismaTransaction.user.findMany({
        select: { id: true },
      });
      
      // Create notifications
      await Promise.all(
        users.map((user: any) => 
          prismaTransaction.notification.create({
            data: {
              type: 'ORDER_UPDATED',
              content: `${existingItem.menuItem.name} in order #${orderId.substring(0, 8)} is now ${status}`,
              orderId,
              userId: user.id,
            }
          })
        )
      );
      
      return { item: updatedItem, order: updatedOrder };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Update order item status error:', error);
    res.status(500).json({ message: 'Server error updating order item status' });
  }
};

// Mark order as urgent (renamed from updateOrderPriority)
export const updateOrderUrgency = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    const { isUrgent } = req.body;
    
    // Check if isUrgent is provided
    if (isUrgent === undefined) {
      return res.status(400).json({ message: 'isUrgent must be provided' });
    }
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order priority
    const order = await prisma.$transaction(async (prismaTransaction) => {
      // Update the order
      const updatedOrder = await prismaTransaction.order.update({
        where: { id },
        data: {
          isUrgent: isUrgent,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Create notifications for all users
      const users = await prismaTransaction.user.findMany({
        select: { id: true },
      });
      
      // Determine notification content
      let content = `Order #${id.substring(0, 8)} priority updated`;
      content += isUrgent ? ' - marked as URGENT' : ' - no longer urgent';
      
      // Create notifications
      await Promise.all(
        users.map((user: any) => 
          prismaTransaction.notification.create({
            data: {
              type: 'ORDER_UPDATED',
              content,
              orderId: id,
              userId: user.id,
            }
          })
        )
      );
      
      return updatedOrder;
    });
    
    res.json(order);
  } catch (error) {
    console.error('Update order urgency error:', error);
    res.status(500).json({ message: 'Server error updating order urgency' });
  }
}; 