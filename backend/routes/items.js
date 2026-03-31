import express from 'express';
import Item from '../models/Item.js';

const router = express.Router();

// GET all catalog items (items/services)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new catalog item - admin only
router.post('/', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }

    const { name, unitPrice } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const price = Number(unitPrice);
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: 'Invalid unitPrice' });
    }

    const item = new Item({
      name: name.trim(),
      unitPrice: price,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Item with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT update a catalog item - admin only
router.put('/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }

    const { name, unitPrice } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const price = Number(unitPrice);
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: 'Invalid unitPrice' });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), unitPrice: price },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Item with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE a catalog item - admin only
router.delete('/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin only' });
    }

    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

