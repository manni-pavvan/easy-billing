import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './models/Invoice.js';
import Client from './models/Client.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easybilling';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

async function migrate() {
    try {
        console.log('--- Starting Client Migration ---');
        const invoices = await Invoice.find({});
        console.log(`Found ${invoices.length} invoices.`);

        const customerMap = {};

        // 1. Aggregate data from invoices
        for (const inv of invoices) {
            if (!inv.customerName) continue;

            const name = inv.customerName.trim();
            if (!customerMap[name]) {
                customerMap[name] = {
                    name: name,
                    totalSpent: 0,
                    lastInvoiceDate: new Date(0), // Epoch
                    invoices: []
                };
            }

            // Update stats
            customerMap[name].totalSpent += (inv.grandTotal || 0);

            const invDate = new Date(inv.invoiceDate);
            if (invDate > customerMap[name].lastInvoiceDate) {
                customerMap[name].lastInvoiceDate = invDate;
            }

            customerMap[name].invoices.push(inv._id);
        }

        console.log(`Identified ${Object.keys(customerMap).length} unique clients.`);

        // 2. Update/Create Clients
        for (const name of Object.keys(customerMap)) {
            const data = customerMap[name];

            // Check if client exists
            let client = await Client.findOne({ name: name });

            if (!client) {
                console.log(`Creating new client: "${name}"`);
                client = await Client.create({
                    name: data.name,
                    totalSpent: data.totalSpent,
                    lastInvoiceDate: data.lastInvoiceDate
                });
            } else {
                console.log(`Updating existing client: "${name}"`);
                // Recalculate totals to ensure accuracy
                // Note: In a real app, we might want to be careful about overwriting if the Client mod had manual edits.
                // But here, the goal is to sync with invoices.
                client.totalSpent = data.totalSpent;
                if (data.lastInvoiceDate > client.lastInvoiceDate) {
                    client.lastInvoiceDate = data.lastInvoiceDate;
                }
                await client.save();
            }

            // 3. Link Invoices to Client
            if (data.invoices.length > 0) {
                await Invoice.updateMany(
                    { _id: { $in: data.invoices } },
                    { $set: { client: client._id } }
                );
            }
        }

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);

    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
