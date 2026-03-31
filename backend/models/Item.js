import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);

