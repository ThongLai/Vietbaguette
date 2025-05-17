/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// Get all orders
router.get('/', (async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, createdBy: true }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}) as any);

// Get order by id
router.get('/:id', (async (req: any, res: any) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, createdBy: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}) as any);

// Create order
router.post('/', (async (req: any, res: any) => {
  try {
    const { createdById, items, isVIP, isUrgent, total } = req.body;
    const order = await prisma.order.create({
      data: {
        createdById,
        isVIP,
        isUrgent,
        total,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
}) as any);

// Update order status
router.put('/:id/status', (async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
}) as any);

// Delete order
router.delete('/:id', (async (req: any, res: any) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
}) as any);

export default router;