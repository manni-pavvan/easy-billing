import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import invoiceRoutes from './routes/invoices.js';
import clientRoutes from './routes/clients.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import protect from './middleware/authMiddleware.js';
import itemsRoutes from './routes/items.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easybilling';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing required env var: JWT_SECRET');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/clients', protect, clientRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/items', protect, itemsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
