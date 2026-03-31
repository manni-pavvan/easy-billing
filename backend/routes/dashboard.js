import express from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const totalClients = await Client.countDocuments();
        const invoices = await Invoice.find();

        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;

        res.json({
            totalClients,
            totalRevenue,
            pendingInvoices,
            paidInvoices,
            averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,

            // Monthly Revenue (Last 6 Months)
            monthlyRevenue: (() => {
                const months = {};
                const today = new Date();
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                    months[key] = 0;
                }

                invoices.forEach(inv => {
                    if (inv.status === 'paid' || inv.status === 'pending') { // Count both or just paid? Usually reports show accrued revenue. Let's count all non-draft/cancelled if any.
                        const d = new Date(inv.invoiceDate);
                        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                        if (months.hasOwnProperty(key)) {
                            months[key] += inv.grandTotal || 0;
                        }
                    }
                });

                return Object.entries(months).map(([month, amount]) => ({ month, amount }));
            })(),

            // Top 5 Clients
            topClients: await Client.find().sort({ totalSpent: -1 }).limit(5).select('name totalSpent email')
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
