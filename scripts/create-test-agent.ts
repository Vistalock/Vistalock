import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function main() {
    try {
        // 1. Login as Merchant
        console.log('Logging in as Merchant...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant@test.com',
            password: 'MerchantPass123!'
        });

        const token = loginRes.data.access_token;
        console.log('Login successful. Token obtained.');

        // 2. Create Agent
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

        // 3. Verify Agent in List
        console.log('Fetching Agent List...');
        const listRes = await axios.get(`${API_URL}/auth/agents`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const createdAgent = listRes.data.find((a: any) => a.email === agentData.email);
        if (createdAgent) {
            console.log('✅ Verification Passed: Agent found in list.');
            console.log({
                Name: createdAgent.agentProfile.fullName,
                Status: createdAgent.agentProfile.status,
                Branch: createdAgent.agentProfile.branch
            });
        } else {
            console.error('❌ Verification Failed: Agent not found in list.');
        }

    } catch (error: any) {
        const errorData = error.response?.data || error.message;
        console.error('Error:', errorData);
        const fs = require('fs');
        fs.writeFileSync('agent_error.json', JSON.stringify(errorData, null, 2));
    }
}

main();
