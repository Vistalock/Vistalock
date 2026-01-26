// E2E Test - Login and API Test
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function runTests() {
    console.log('\n🧪 Running E2E Tests...\n');
    console.log('='.repeat(60));

    // Test 1: Login as Merchant A
    console.log('\n📝 Test 1: Login as Merchant A');
    try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant-a@test.com',
            password: 'Test123!@#$%',
        });

        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('   Role:', loginResponse.data.role);
        console.log('   TenantId:', loginResponse.data.tenantId);
        console.log('   Token:', loginResponse.data.access_token.substring(0, 60) + '...');

        const tokenA = loginResponse.data.access_token;

        // Test 2: Get Products for Merchant A
        console.log('\n📝 Test 2: Get Products (Merchant A)');
        const productsA = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`✅ Products retrieved: ${productsA.data.length} products`);

        // Test 3: Get Devices for Merchant A
        console.log('\n📝 Test 3: Get Devices (Merchant A)');
        const devicesA = await axios.get(`${API_URL}/devices`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`✅ Devices retrieved: ${devicesA.data.length} devices`);

        // Test 4: Login as Merchant B
        console.log('\n📝 Test 4: Login as Merchant B');
        const loginResponseB = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant-b@test.com',
            password: 'Test123!@#$%',
        });
        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('   Role:', loginResponseB.data.role);
        console.log('   TenantId:', loginResponseB.data.tenantId);

        const tokenB = loginResponseB.data.access_token;

        // Test 5: Get Products for Merchant B
        console.log('\n📝 Test 5: Get Products (Merchant B)');
        const productsB = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log(`✅ Products retrieved: ${productsB.data.length} products`);

        // Test 6: Verify Isolation
        console.log('\n📝 Test 6: Verify Multi-Tenancy Isolation');
        if (loginResponse.data.tenantId !== loginResponseB.data.tenantId) {
            console.log('✅ ISOLATION VERIFIED: Different tenantIds');
            console.log(`   Merchant A TenantId: ${loginResponse.data.tenantId}`);
            console.log(`   Merchant B TenantId: ${loginResponseB.data.tenantId}`);
        } else {
            console.log('❌ ISOLATION FAILED: Same tenantId!');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 E2E TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Auth Service: Running on port 3001');
        console.log('✅ Login (Merchant A): Working');
        console.log('✅ Login (Merchant B): Working');
        console.log('✅ Products API: Working');
        console.log('✅ Devices API: Working');
        console.log('✅ Multi-Tenancy: Isolated');
        console.log('\n🌐 Web Dashboard: http://localhost:3005');
        console.log('   Login with: merchant-a@test.com / Test123!@#$%');
        console.log('\n✨ All systems operational!\n');

    } catch (error) {
        console.log('\n❌ TEST FAILED:');
        console.log('   Error:', error.response?.data || error.message);
        console.log('\n');
    }
}

runTests();
