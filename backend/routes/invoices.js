import express from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Item from '../models/Item.js';

const router = express.Router();

// GET all invoices (for admin "Invoice History" and "My Invoices")
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single invoice by id
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create invoice
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      invoiceNumber,
      invoiceDate,
      items,
      taxPercent = 5,
      status = 'pending',
    } = req.body;

    if (!customerName || !invoiceNumber || !invoiceDate || !items?.length) {
      return res.status(400).json({
        message: 'Missing required fields: customerName, invoiceNumber, invoiceDate, items',
      });
    }

    // Find or create client
    let client = await Client.findOne({ name: customerName });
    if (!client) {
      client = new Client({
        name: customerName,
        mobile: customerMobile
      });
    } else if (customerMobile) {
      // Update mobile if provided and different? Or just keep existing?
      // Let's update it to ensure latest contact info.
      client.mobile = customerMobile;
    }

    const itemPayload = Array.isArray(items) ? items : [];

    // Enforce that invoice items come only from the admin-defined catalog.
    const itemIds = [...new Set(itemPayload.map((i) => i?.itemId).filter(Boolean))];
    const itemNames = [...new Set(itemPayload.map((i) => i?.name).filter(Boolean).map((n) => String(n).trim()).filter(Boolean))];

    const or = [];
    if (itemIds.length) or.push({ _id: { $in: itemIds } });
    if (itemNames.length) or.push({ name: { $in: itemNames } });

    const catalogItems = or.length ? await Item.find({ $or: or }) : [];
    const itemMapById = new Map(catalogItems.map((it) => [it._id.toString(), it]));
    const itemMapByName = new Map(catalogItems.map((it) => [it.name, it]));

    const parsedItems = itemPayload.map((item) => {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty < 1) {
        throw new Error('Invalid quantity for an item');
      }

      const catalogById = item.itemId ? itemMapById.get(String(item.itemId)) : undefined;
      const catalogByName = !catalogById && item.name ? itemMapByName.get(String(item.name).trim()) : undefined;
      const catalogItem = catalogById || catalogByName;

      if (!catalogItem) {
        throw new Error('Invalid item. Item must be selected from the admin catalog.');
      }

      const unitPrice = Number(catalogItem.unitPrice);
      const total = qty * unitPrice;
      return {
        itemId: catalogItem._id,
        name: catalogItem.name,
        quantity: qty,
        unitPrice,
        total,
      };
    });

    const subtotal = parsedItems.reduce((sum, i) => sum + i.total, 0);
    const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    // Update client stats
    client.totalSpent += grandTotal;
    client.lastInvoiceDate = new Date(invoiceDate);
    await client.save();

    const invoice = new Invoice({
      customerName,
      client: client._id,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: new Date(invoiceDate),
      items: parsedItems,
      subtotal,
      taxPercent: Number(taxPercent) || 5,
      taxAmount,
      grandTotal,
      status: status || 'pending',
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    const msg = err?.message || 'Failed to create invoice';
    if (msg.startsWith('Invalid item') || msg.startsWith('Invalid quantity')) {
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: msg });
  }
});

// PATCH update invoice (e.g. status)
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
