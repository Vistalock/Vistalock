// Create test merchants using the auth service's register endpoint
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function createTestMerchants() {
    console.log('🔧 Creating test merchants via API...\n');

    // Merchant A
    try {
        const responseA = await axios.post(`${API_URL}/auth/register`, {
            email: 'merchant-a@test.com',
            password: 'Test123!',
            role: 'MERCHANT',
            businessName: 'Tech Store A',
            businessAddress: '123 Tech Street, Lagos',
            contactPerson: 'John Merchant',
            phoneNumber: '+2348011111111',
        });
        console.log('✅ Merchant A created:', responseA.data);
    } catch (e) {
        if (e.response?.status === 409) {
            console.log('⚠️  Merchant A already exists');
        } else {
            console.log('❌ Error creating Merchant A:', e.response?.data || e.message);
        }
    }

    // Merchant B
    try {
        const responseB = await axios.post(`${API_URL}/auth/register`, {
            email: 'merchant-b@test.com',
            password: 'Test123!',
            role: 'MERCHANT',
            businessName: 'Electronics Hub B',
            businessAddress: '456 Electronics Ave, Abuja',
            contactPerson: 'Jane Merchant',
            phoneNumber: '+2348022222222',
        });
        console.log('✅ Merchant B created:', responseB.data);
    } catch (e) {
        if (e.response?.status === 409) {
            console.log('⚠️  Merchant B already exists');
        } else {
            console.log('❌ Error creating Merchant B:', e.response?.data || e.message);
        }
    }

    // Test login
    console.log('\n🔐 Testing login...');
    try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant-a@test.com',
            password: 'Test123!',
        });
        console.log('✅ Login successful!');
        console.log('   Role:', loginResponse.data.role);
        console.log('   TenantId:', loginResponse.data.tenantId);
        console.log('   Token:', loginResponse.data.access_token.substring(0, 50) + '...');
    } catch (e) {
        console.log('❌ Login failed:', e.response?.data || e.message);
    }

    console.log('\n✅ Setup complete!\n');
}

createTestMerchants()
    .catch(console.error);
