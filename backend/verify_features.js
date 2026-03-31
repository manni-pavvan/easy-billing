const BASE_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Initial Stats
        console.log('1. Fetching Initial Stats...');
        const initialStatsRes = await fetch(`${BASE_URL}/dashboard/stats`);
        const initialStats = await initialStatsRes.json();
        console.log('Initial Stats:', initialStats);

        // 2. Initial Clients
        console.log('2. Fetching Initial Clients...');
        const initialClientsRes = await fetch(`${BASE_URL}/clients`);
        const initialClients = await initialClientsRes.json();
        console.log('Initial Client Count:', initialClients.length);

        // 3. Create Invoice
        console.log('3. Creating New Live Invoice...');
        const newInvoice = {
            customerName: `Test Client ${Date.now()}`,
            invoiceNumber: `INV-${Date.now()}`,
            invoiceDate: new Date().toISOString(),
            items: [{ name: 'Test Item', quantity: 2, unitPrice: 100 }],
        };

        const createRes = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInvoice),
        });
        const createdInvoice = await createRes.json();
        console.log('Invoice Created:', createdInvoice.invoiceNumber);

        // 4. Verify Client Created
        console.log('4. Verifying Client Creation...');
        const afterClientsRes = await fetch(`${BASE_URL}/clients`);
        const afterClients = await afterClientsRes.json();
        console.log('New Client Count:', afterClients.length);
        if (afterClients.length > initialClients.length) {
            console.log('SUCCESS: Client count increased.');
        } else {
            console.error('FAILURE: Client count did not increase.');
        }

        // 5. Mark as Paid
        console.log('5. Marking Invoice as Paid...');
        const patchRes = await fetch(`${BASE_URL}/invoices/${createdInvoice._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'paid' }),
        });
        const updatedInvoice = await patchRes.json();
        console.log('Invoice Status:', updatedInvoice.status);
        if (updatedInvoice.status === 'paid') {
            console.log('SUCCESS: Invoice marked as paid.');
        } else {
            console.error('FAILURE: Invoice status not updated.');
        }

        // 6. Final Stats
        console.log('6. Fetching Final Stats...');
        const finalStatsRes = await fetch(`${BASE_URL}/dashboard/stats`);
        const finalStats = await finalStatsRes.json();
        console.log('Final Stats:', finalStats);

        if (finalStats.totalRevenue > initialStats.totalRevenue) {
            console.log('SUCCESS: Total Revenue increased.');
        }

        console.log('--- Verification Complete ---');
    } catch (err) {
        console.error('Verification Failed:', err);
    }
}

verify();
