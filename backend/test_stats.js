import mongoose from 'mongoose';
import Invoice from './models/Invoice.js';
import Client from './models/Client.js';
import dotenv from 'dotenv';

dotenv.config();

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/easybilling');
        console.log('Connected to MongoDB');

        const invoices = await Invoice.find();
        console.log('\n=== INVOICE DATA ===');
        console.log('Total invoices:', invoices.length);
        
        invoices.forEach(inv => {
            console.log(`Invoice: ${inv.invoiceNumber}, Date: ${inv.invoiceDate}, Amount: ${inv.grandTotal}, Status: ${inv.status}`);
        });

        // Test monthly revenue calculation
        console.log('\n=== MONTHLY REVENUE CALCULATION ===');
        const months = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            months[key] = 0;
        }

        console.log('Month buckets:', Object.keys(months));

        invoices.forEach(inv => {
            if (inv.status === 'paid' || inv.status === 'pending') {
                const d = new Date(inv.invoiceDate);
                const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                console.log(`Invoice ${inv.invoiceNumber}: date=${inv.invoiceDate}, key=${key}, amount=${inv.grandTotal}`);
                if (months.hasOwnProperty(key)) {
                    months[key] += inv.grandTotal || 0;
                    console.log(`  -> Added to ${key}, new total: ${months[key]}`);
                } else {
                    console.log(`  -> Key ${key} not in buckets (outside 6 month range)`);
                }
            }
        });

        console.log('\n=== FINAL MONTHLY REVENUE ===');
        const monthlyRevenue = Object.entries(months).map(([month, amount]) => ({ month, amount }));
        console.log(JSON.stringify(monthlyRevenue, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testStats();
