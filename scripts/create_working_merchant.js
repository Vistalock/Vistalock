const axios = require('axios');

async function registerAndLogin() {
    const timestamp = Date.now();
    const email = `merchant${timestamp}@vistalock.com`;
    const password = 'TestMerchant123!';

    try {
        // Register
        console.log(`Registering new merchant: ${email}...`);
        const registerRes = await axios.post('http://localhost:3001/auth/register', {
            email,
            password,
            role: 'MERCHANT'
        });
        console.log('✅ Registration successful!', registerRes.data);

        // Login
        console.log('\nLogging in...');
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email,
            password
        });
        console.log('✅ Login successful!');
        console.log('Token:', loginRes.data.access_token);
        console.log('\n=== USE THESE CREDENTIALS ===');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

registerAndLogin();
