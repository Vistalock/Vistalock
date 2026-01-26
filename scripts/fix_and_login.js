const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const axios = require('axios');

async function fixAndLogin() {
    const connectionString = 'postgresql://user:secret123@127.0.0.1:5433/vistalock_local';
    const email = 'andywhite@vistalock.com';
    const password = 'AgentPass123!';

    try {
        // 1. Generate Hash
        const hash = await bcrypt.hash(password, 10);
        console.log('Generated Hash:', hash);

        // 2. Update DB
        const client = new Client({ connectionString });
        await client.connect();
        await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [hash, email]);
        console.log('✅ Database updated with new hash');
        await client.end();

        // 3. Login
        console.log('Attempting login...');
        const response = await axios.post('http://localhost:3001/auth/login', {
            email,
            password
        });
        console.log('✅ Login Successful!');
        console.log('Token:', response.data.access_token);

    } catch (error) {
        console.error('❌ Failed:', error.response?.data || error.message);
    }
}

fixAndLogin();
