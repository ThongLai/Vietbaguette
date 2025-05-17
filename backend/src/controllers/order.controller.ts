import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

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
  isVIP: z.boolean().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED']),
});

const updateOrderItemStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED']),
});

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    // Base query
    const where: any = {};
    
    // Filter by status if provided
    if (status && ['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'].includes(status as string)) {
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
    
    const { items, tableNumber, customerName, isUrgent, isVIP } = validation.data;
    
    // Calculate total price
    let total = 0;
    
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
      
      // Calculate total and prepare order items
      const orderItemsData = await Promise.all(items.map(async item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) {
          throw new Error(`Menu item with ID ${item.menuItemId} not found`);
        }
        
        // Base price calculation
        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;
        
        // Handle selected options if any
        const selectedOptionsData = item.selectedOptions?.map(option => {
          const menuOption = menuItem.options.find(opt => opt.id === option.menuOptionId);
          if (!menuOption) {
            throw new Error(`Menu option with ID ${option.menuOptionId} not found`);
          }
          
          const optionChoice = menuOption.choices.find(choice => choice.id === option.optionChoiceId);
          if (!optionChoice) {
            throw new Error(`Option choice with ID ${option.optionChoiceId} not found`);
          }
          
          // Add option price to total if any
          if (optionChoice.price) {
            total += optionChoice.price * item.quantity;
          }
          
          return {
            menuOptionId: option.menuOptionId,
            optionChoiceId: option.optionChoiceId,
            extraPrice: optionChoice.price,
          };
        });
        
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
          status: 'PENDING',
          selectedOptions: selectedOptionsData
            ? {
                create: selectedOptionsData,
              }
            : undefined,
        };
      }));
      
      // Create the order with items
      const newOrder = await tx.order.create({
        data: {
          total,
          tableNumber,
          customerName,
          isUrgent: isUrgent ?? false,
          isVIP: isVIP ?? false,
          createdById: req.user.id,
          items: {
            create: orderItemsData,
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
        users.map(user => 
          tx.notification.create({
            data: {
              type: 'NEW_ORDER',
              content: `New order #${newOrder.id.substring(0, 8)} has been placed`,
              orderId: newOrder.id,
              userId: user.id,
            }
          })
        )
      );
      
      return newOrder;
    });
    
    // Return the new order
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
    
    const { status } = validation.data;
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    const order = await prisma.$transaction(async (tx) => {
      // Update the order
      const updatedOrder = await tx.order.update({
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
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: { status },
        });
      }
      
      // Create notifications for all users
      const users = await tx.user.findMany({
        select: { id: true },
      });
      
      // Create notifications
      await Promise.all(
        users.map(user => 
          tx.notification.create({
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
    
    res.json(order);
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
    
    const { status } = validation.data;
    
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
    const result = await prisma.$transaction(async (tx) => {
      // Update the item
      const updatedItem = await tx.orderItem.update({
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
      const otherItems = await tx.orderItem.findMany({
        where: {
          orderId,
          id: { not: itemId },
        },
      });
      
      // If all other items have the same status, update the order
      const allItemsHaveSameStatus = otherItems.length === 0 || 
        otherItems.every(item => item.status === status);
      
      let updatedOrder = null;
      
      if (allItemsHaveSameStatus) {
        updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status },
        });
      }
      
      // Create notifications for all users
      const users = await tx.user.findMany({
        select: { id: true },
      });
      
      // Create notifications
      await Promise.all(
        users.map(user => 
          tx.notification.create({
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

// Mark order as urgent or VIP
export const updateOrderPriority = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    const { isUrgent, isVIP } = req.body;
    
    // Check if at least one field is provided
    if (isUrgent === undefined && isVIP === undefined) {
      return res.status(400).json({ message: 'At least one of isUrgent or isVIP must be provided' });
    }
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order priority
    const order = await prisma.$transaction(async (tx) => {
      // Update the order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          isUrgent: isUrgent !== undefined ? isUrgent : existingOrder.isUrgent,
          isVIP: isVIP !== undefined ? isVIP : existingOrder.isVIP,
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
      const users = await tx.user.findMany({
        select: { id: true },
      });
      
      // Determine notification content
      let content = `Order #${id.substring(0, 8)} priority updated`;
      if (isUrgent !== undefined) {
        content += isUrgent ? ' - marked as URGENT' : ' - no longer urgent';
      }
      if (isVIP !== undefined) {
        content += isVIP ? ' - marked as VIP' : ' - no longer VIP';
      }
      
      // Create notifications
      await Promise.all(
        users.map(user => 
          tx.notification.create({
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
    console.error('Update order priority error:', error);
    res.status(500).json({ message: 'Server error updating order priority' });
  }
}; 