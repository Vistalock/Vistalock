const axios = require('axios');

async function setupAgent() {
    const merchantEmail = 'merchant1767873756505@vistalock.com';
    const merchantPassword = 'TestMerchant123!';

    try {
        // 1. Login as merchant
        console.log('Logging in as merchant...');
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: merchantEmail,
            password: merchantPassword
        });
        const token = loginRes.data.access_token;
        console.log('✅ Merchant logged in');

        // 2. Create agent via API (this will create with no password)
        console.log('\nCreating agent via API...');
        const agentRes = await axios.post('http://localhost:3001/auth/create-agent', {
            email: 'testagent@vistalock.com',
            fullName: 'Test Agent',
            phoneNumber: '08012345678',
            branch: 'Lagos Branch',
            onboardingLimit: 5
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Agent created:', agentRes.data);

        // 3. Manually set password for the agent
        console.log('\nSetting password for agent...');
        const registerRes = await axios.post('http://localhost:3001/auth/register', {
            email: 'testagent@vistalock.com',
            password: 'AgentPass123!',
            role: 'MERCHANT_AGENT'
        });
        console.log('✅ Agent password set');

        console.log('\n=== AGENT LOGIN CREDENTIALS ===');
        console.log('Email: testagent@vistalock.com');
        console.log('Password: AgentPass123!');

    } catch (error) {
        if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
            console.log('\n✅ Agent already exists, trying direct login...');
            console.log('\n=== AGENT LOGIN CREDENTIALS ===');
            console.log('Email: testagent@vistalock.com');
            console.log('Password: AgentPass123!');
        } else {
            console.error('❌ Error:', error.response?.data || error.message);
        }
    }
}

setupAgent();
