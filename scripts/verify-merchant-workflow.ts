
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function main() {
    console.log('🔄 Starting Merchant Workflow Verification...');

    // 1. Login as Super Admin to get Token
    console.log('🔑 Logging in as Super Admin...');
    let token;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@vistalock.com',
            password: 'AdminPass123!'
        });
        token = loginRes.data.access_token;
        console.log('✅ Login successful. Token retrieved.');
    } catch (e: any) {
        console.error('❌ Login Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. List Applications
    console.log('\n📋 Fetching Applications...');
    let pendingAppId, opsAppId, riskAppId;
    try {
        const appsRes = await axios.get(`${API_URL}/admin/merchant-applications`, { headers });
        const apps = appsRes.data;
        console.log(`✅ Found ${apps.length} applications.`);

        // Find apps for testing
        pendingAppId = apps.find((a: any) => a.status === 'PENDING')?.id;
        opsAppId = apps.find((a: any) => a.status === 'OPS_REVIEWED')?.id;
        riskAppId = apps.find((a: any) => a.status === 'RISK_REVIEWED')?.id;

        console.log('   - Pending App ID:', pendingAppId || 'NOT FOUND');
        console.log('   - Ops Reviewed App ID:', opsAppId || 'NOT FOUND');
        console.log('   - Risk Reviewed App ID:', riskAppId || 'NOT FOUND');
    } catch (e: any) {
        console.error('❌ List Applications Failed:', e.response?.data || e.message);
    }

    // 3. Test Ops Review
    if (pendingAppId) {
        console.log(`\n👮 Testing Ops Review on ${pendingAppId}...`);
        try {
            await axios.post(`${API_URL}/admin/merchant-applications/${pendingAppId}/review-ops`, {}, { headers });
            console.log('✅ Ops Review Successful.');
        } catch (e: any) {
            console.error('❌ Ops Review Failed:', e.response?.data || e.message);
        }
    }

    // 4. Test Risk Review
    if (opsAppId) {
        console.log(`\n⛔ Testing Risk Review on ${opsAppId}...`);
        try {
            await axios.post(`${API_URL}/admin/merchant-applications/${opsAppId}/review-risk`, {}, { headers });
            console.log('✅ Risk Review Successful.');
        } catch (e: any) {
            console.error('❌ Risk Review Failed:', e.response?.data || e.message);
        }
    }

    // 5. Test Final Approval
    if (riskAppId) {
        console.log(`\n✅ Testing Final Approval on ${riskAppId}...`);
        try {
            await axios.post(`${API_URL}/admin/merchant-applications/${riskAppId}/approve`, {}, { headers });
            console.log('✅ Final Approval Successful.');
        } catch (e: any) {
            console.error('❌ Final Approval Failed:', e.response?.data || e.message);
        }
    }
}

main();
