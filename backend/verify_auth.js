const BASE_URL = 'http://localhost:5000/api';

async function verifyAuth() {
    try {
        console.log('--- Starting Auth Verification ---');
        const timestamp = Date.now();
        const user = {
            username: `testuser_${timestamp}`,
            email: `test_${timestamp}@example.com`,
            password: 'password123'
        };

        // 1. Try accessing protected route without token
        console.log('1. Testing Protected Route (No Token)...');
        const noTokenRes = await fetch(`${BASE_URL}/dashboard/stats`);
        if (noTokenRes.status === 401) {
            console.log('SUCCESS: Access denied as expected (401).');
        } else {
            console.error(`FAILURE: Unexpected status ${noTokenRes.status}`);
        }

        // 2. Register
        console.log('2. Registering New User...');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const registerData = await registerRes.json();
        if (registerRes.ok && registerData.token) {
            console.log('SUCCESS: User registered and token received.');
        } else {
            console.error('FAILURE: Registration failed:', registerData);
            return;
        }

        // 3. Login
        console.log('3. Logging In...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: user.password })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (loginRes.ok && token) {
            console.log('SUCCESS: Login successful.');
        } else {
            console.error('FAILURE: Login failed:', loginData);
            return;
        }

        // 4. Access Protected Route with Token
        console.log('4. Testing Protected Route (With Token)...');
        const protectedRes = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (protectedRes.ok) {
            console.log('SUCCESS: Access granted.');
        } else {
            console.error(`FAILURE: Access denied with status ${protectedRes.status}`);
        }

        console.log('--- Auth Verification Complete ---');
    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verifyAuth();
