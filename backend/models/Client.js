import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String }, // New field
    email: { type: String }, // Optional
    address: { type: String },
    totalSpent: { type: Number, default: 0 },
    lastInvoiceDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
