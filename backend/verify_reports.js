const BASE_URL = 'http://localhost:5000/api';

async function verifyReports() {
    try {
        console.log('--- Starting Reports Verification ---');

        console.log('1. Login to get token...');
        // We need a token. We can register a new user or login existing.
        // Let's try to login with the user we created in verify_auth.js if possible, 
        // or just creating a new one to be sure.
        const timestamp = Date.now();
        const user = {
            username: `report_tester_${timestamp}`,
            email: `report_${timestamp}@example.com`,
            password: 'password123'
        };

        // Register
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const authData = await registerRes.json();
        const token = authData.token;

        if (!token) {
            console.error('Failed to get token');
            return;
        }

        console.log('2. Fetching Dashboard/Stats (Reports Data)...');
        const res = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        console.log('Keys received:', Object.keys(data));

        if (data.monthlyRevenue && Array.isArray(data.monthlyRevenue)) {
            console.log('SUCCESS: monthlyRevenue is present and is an array.');
            console.log('monthlyRevenue:', JSON.stringify(data.monthlyRevenue, null, 2));
        } else {
            console.error('FAILURE: monthlyRevenue missing or invalid.');
        }

        if (data.topClients && Array.isArray(data.topClients)) {
            console.log('SUCCESS: topClients is present and is an array.');
        } else {
            console.error('FAILURE: topClients missing or invalid.');
        }

        if (typeof data.averageInvoiceValue === 'number') {
            console.log('SUCCESS: averageInvoiceValue is a number:', data.averageInvoiceValue);
        } else {
            console.warn('FAILURE: averageInvoiceValue missing or invalid type.');
        }

        console.log('--- Reports Verification Complete ---');

    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verifyReports();
