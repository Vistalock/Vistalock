
import axios from 'axios';
import * as fs from 'fs';

const API_URL = 'http://localhost:3001';

async function main() {
    console.log('🚀 Generating Agent Invite Link...');

    // 1. Login as Merchant
    let token;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant@test.com',
            password: 'MerchantPass123!'
        });
        token = loginRes.data.access_token;
    } catch (e: any) {
        console.error('❌ Merchant Login Failed:', e.response?.data?.message || e.message);
        process.exit(1);
    }

    // 2. Invite Agent
    try {
        const inviteRes = await axios.post(`${API_URL}/auth/agents/invite`, {
            email: `agent-${Date.now()}@vistalock.com`,
            fullName: 'Test Agent Mobile',
            phoneNumber: '08011223344',
            branch: 'Lagos Main'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const inviteLink = inviteRes.data.activationLink;
        console.log(`✅ Invite Sent. Link: ${inviteLink}`);

        // Write to batch file for easy execution
        const adbPath = 'C:\\Users\\abc\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';
        const cmd = `"${adbPath}" shell am start -W -a android.intent.action.VIEW -d "${inviteLink}"`;
        fs.writeFileSync('run_activation.bat', cmd);
        console.log('✅ Created run_activation.bat');

    } catch (e: any) {
        console.error('❌ Invite Failed:', e.response?.data?.message || e.message);
    }
}

main();
