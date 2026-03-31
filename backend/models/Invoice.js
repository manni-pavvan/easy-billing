import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: false },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  items: [itemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 5 },
  taxAmount: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'pending', 'paid', 'overdue'], default: 'pending' },
  createdBy: { type: String, default: 'admin' },
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
