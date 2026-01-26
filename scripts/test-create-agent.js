// Test creating an agent via API
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testCreateAgent() {
    console.log('🧪 Testing Agent Creation\n');
    console.log('='.repeat(60));

    // Step 1: Login as merchant
    console.log('\n📝 Step 1: Login as Merchant');
    try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant-test-new@vistalock.com',
            password: 'Test123!@#$%',
        });

        console.log('✅ Login successful!');
        console.log('   Role:', loginResponse.data.role);
        console.log('   TenantId:', loginResponse.data.tenantId);

        const token = loginResponse.data.access_token;

        // Step 2: Create agent
        console.log('\n📝 Step 2: Create Agent');
        const agentData = {
            fullName: 'Test Agent',
            phoneNumber: '+2347049159042', // Your Twilio number for testing
            email: 'testagent@vistalock.com',
            branch: 'Lagos Test Branch',
            onboardingLimit: 10
        };

        console.log('   Agent Data:', agentData);

        const createResponse = await axios.post(`${API_URL}/agents`, agentData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n✅ AGENT CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('Agent ID:', createResponse.data.agentId);
        console.log('Full Name:', createResponse.data.fullName);
        console.log('Phone:', createResponse.data.phoneNumber);
        console.log('\n📱 Activation Link:');
        console.log(createResponse.data.activationLink);
        console.log('\n⏰ Expires At:', new Date(createResponse.data.expiresAt).toLocaleString());
        console.log('='.repeat(60));

        // Step 3: List agents
        console.log('\n📝 Step 3: List All Agents');
        const listResponse = await axios.get(`${API_URL}/agents`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ Found ${listResponse.data.length} agent(s):`);
        listResponse.data.forEach((agent, index) => {
            console.log(`\n${index + 1}. ${agent.agentProfile.fullName}`);
            console.log(`   Phone: ${agent.agentProfile.phoneNumber}`);
            console.log(`   Branch: ${agent.agentProfile.branch}`);
            console.log(`   Status: ${agent.agentProfile.status}`);
            console.log(`   Activated: ${agent.agentProfile.isActivated ? 'Yes' : 'No'}`);
        });

        console.log('\n🎉 Test completed successfully!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
        console.log('\n');
    }
}

testCreateAgent();
