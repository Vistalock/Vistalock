
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function main() {
    try {
        const uniqueEmail = `merchant.auto.${Date.now()}@test.com`;
        const password = 'MerchantPass123!';

        // 1. Register
        console.log(`Registering new merchant: ${uniqueEmail}`);
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email: uniqueEmail,
            password: password,
            role: 'MERCHANT'
        });
        console.log('Registration successful:', registerRes.data);

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: uniqueEmail,
            password: password
        });

        const token = loginRes.data.access_token;
        console.log('Login successful. Token obtained.');

        // 3. Create Agent
        console.log('Creating Test Agent...');
        const agentData = {
            fullName: 'Test Agent 01',
            email: `agent.invite.${Date.now()}@vistalock.com`,
            phoneNumber: '08012345678',
            branch: 'Headquarters',
            onboardingLimit: 5
        };

        const createRes = await axios.post(`${API_URL}/auth/agents`, agentData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Agent created successfully:', createRes.data);

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();
