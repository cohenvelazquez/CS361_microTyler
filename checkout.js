// index.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// parse JSON request bodies
app.use(express.json());

// In-memory store; swap out for a real DB in prod
const orders = new Map();

/**
 * Order shape:
 * {
 *   orderId: string,
 *   userId: string,
 *   status: 'open' | 'complete',
 *   items: Array<{ productId: string, quantity: number, price: number }>
 * }
 */

// Create a new order (status defaults to 'open')
app.post('/orders', (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'userId and items[] required' });
  }

  const order = {
    orderId: uuidv4(),
    userId,
    status: 'open',
    items
  };

  orders.set(order.orderId, order);
  res.status(201).json(order);
});

// Fetch an existing order
app.get('/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Update an order (e.g. change status or items)
app.put('/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, items } = req.body;
  // Only allow valid status updates
  if (status && !['open', 'complete'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // Merge updates
  if (status) order.status = status;
  if (Array.isArray(items)) order.items = items;

  orders.set(order.orderId, order);
  res.json(order);
});

// Simple health check
app.get('/', (req, res) => res.send('Orders service is up!'));

app.listen(PORT, () => {
  console.log(`Orders microservice listening on http://localhost:${PORT}`);
});