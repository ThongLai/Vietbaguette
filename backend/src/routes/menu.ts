/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// Get all menu items
router.get('/', (async (req: any, res: any) => {
  try {
    const items = await prisma.menuItem.findMany();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
}) as any);

// Get menu item by id
router.get('/:id', (async (req: any, res: any) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
}) as any);

// Create menu item
router.post('/', (async (req: any, res: any) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;
    const item = await prisma.menuItem.create({
      data: { name, description, price, imageUrl, category }
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
}) as any);

// Update menu item
router.put('/:id', (async (req: any, res: any) => {
  try {
    const { name, description, price, imageUrl, category, isActive } = req.body;
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { name, description, price, imageUrl, category, isActive }
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
}) as any);

// Delete menu item
router.delete('/:id', (async (req: any, res: any) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
}) as any);

export default router; 