import { Router } from 'express';

const router = Router();

// GET all orders
router.get('/', (req, res) => {
  res.json({ message: 'GET all orders - Not implemented yet' });
});

// GET a single order by ID
router.get('/:id', (req, res) => {
  res.json({ message: `GET order ${req.params.id} - Not implemented yet` });
});

// POST a new order
router.post('/', (req, res) => {
  res.json({ message: 'POST new order - Not implemented yet', body: req.body });
});

// PUT/update an order
router.put('/:id', (req, res) => {
  res.json({ message: `PUT update order ${req.params.id} - Not implemented yet`, body: req.body });
});

// PATCH an order status
router.patch('/:id/status', (req, res) => {
  res.json({ message: `PATCH order ${req.params.id} status - Not implemented yet`, body: req.body });
});

// DELETE an order
router.delete('/:id', (req, res) => {
  res.json({ message: `DELETE order ${req.params.id} - Not implemented yet` });
});

export default router; 