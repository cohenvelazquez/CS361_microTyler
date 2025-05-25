// index.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// parse JSON request bodies
app.use(express.json());

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

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
app.post('/orders', async (req, res, next) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'userId and items[] required' });
    }

    // Validate items array
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
        return res.status(400).json({ error: 'Invalid item format' });
      }
      if (item.quantity <= 0 || item.price < 0) {
        return res.status(400).json({ error: 'Invalid quantity or price' });
      }
    }

    const order = {
      orderId: uuidv4(),
      userId,
      status: 'open',
      items
    };

    orders.set(order.orderId, order);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Fetch an existing order
app.get('/orders/:orderId', async (req, res, next) => {
  try {
    const order = orders.get(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Update an order (e.g. change status or items)
app.put('/orders/:orderId', async (req, res, next) => {
  try {
    const order = orders.get(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { status, items } = req.body;
    // Only allow valid status updates
    if (status && !['open', 'complete'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate items if provided
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.productId || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
          return res.status(400).json({ error: 'Invalid item format' });
        }
        if (item.quantity <= 0 || item.price < 0) {
          return res.status(400).json({ error: 'Invalid quantity or price' });
        }
      }
    }

    // Create a new order object instead of mutating
    const updatedOrder = {
      ...order,
      ...(status && { status }),
      ...(Array.isArray(items) && { items })
    };

    orders.set(updatedOrder.orderId, updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// Simple health check
app.get('/', async (req, res, next) => {
  try {
    res.send('Orders service is up!');
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Orders microservice listening on http://localhost:${PORT}`);
});