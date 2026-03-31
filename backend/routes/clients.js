import express from 'express';
import Client from '../models/Client.js';

const router = express.Router();

// GET all clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ totalSpent: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE client
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Client deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
