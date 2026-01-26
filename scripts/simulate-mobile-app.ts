
import axios from 'axios';
import { randomBytes } from 'crypto';

const API_URL = 'http://localhost:3001';

// Emulate Mobile App state
const APP_STATE = {
    deviceId: 'android_id_' + randomBytes(8).toString('hex'), // Simulate expo-application.getAndroidId()
    token: null as string | null,
    email: ''
};

async function main() {
    console.log('📱 Starting Mobile App Simulation...');
    console.log(`📱 Simulated Device ID: ${APP_STATE.deviceId}`);

    // Prerequisite: Merchant Admin Invites Agent
    console.log('\n--- Step 0: Merchant Invites Agent ---');
    let inviteLink;
    let merchantToken;

    // Login
    try {
        console.log('Attempting Merchant Login...');
        const merchantLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'merchant@test.com',
            password: 'MerchantPass123!'
        });
        merchantToken = merchantLogin.data.access_token;
        console.log('✅ Merchant Login Successful');
    } catch (e: any) {
        console.error('❌ Merchant Login Failed:', e.response?.data || e.message);
        console.error('Full Error:', JSON.stringify(e, null, 2));
        process.exit(1);
    }

    // Invite
    try {
        console.log('Attempting Agent Invite...');
        const uniqueEmail = `agent-app-test-${Date.now()}@vistalock.com`;
        APP_STATE.email = uniqueEmail;

        const inviteRes = await axios.post(`${API_URL}/auth/agents/invite`, {
            email: uniqueEmail,
            fullName: 'App Simulation Agent',
            phoneNumber: '08123456789',
            branch: 'Simulation Branch'
        }, { headers: { Authorization: `Bearer ${merchantToken}` } });

        inviteLink = inviteRes.data.activationLink;
        console.log(`✅ Invite Sent. Link: ${inviteLink}`);
    } catch (e: any) {
        console.error('❌ Invite Failed:', e.response?.data || e.message);
        console.error('Full Error:', JSON.stringify(e.response?.data || e.message, null, 2));
        process.exit(1);
    }

    // Step 1: "Deep Link" opens App
    console.log('\n--- Step 1: App Handles Deep Link ---');
    const activationToken = inviteLink.split('token=')[1];
    if (!activationToken) {
        console.error('❌ Could not extract token from link');
        process.exit(1);
    }
    console.log(`✅ Token Extracted: ${activationToken}`);

    // Step 2: Activation Screen (Submit OTP & Set Password)
    console.log('\n--- Step 2: Activation (Binding Device) ---');
    try {
        const activateRes = await axios.post(`${API_URL}/auth/agent/activate`, {
            token: activationToken,
            otp: '123456', // User enters valid OTP
            password: 'NewAgentPass123!', // User sets password
            deviceId: APP_STATE.deviceId // App sends Device ID transparently
        });
        console.log('✅ Activation Success:', activateRes.data);
    } catch (e: any) {
        console.error('❌ Step 2 Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // Step 3: Login Screen (Enforce Binding)
    console.log('\n--- Step 3: Login from TRUSTED Device ---');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: APP_STATE.email,
            password: 'NewAgentPass123!',
            deviceId: APP_STATE.deviceId // App sends SAME Device ID
        });
        APP_STATE.token = loginRes.data.access_token;
        console.log('✅ Login Success. Token Received.');
    } catch (e: any) {
        console.error('❌ Step 3 Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // Step 4: Dashboard (Scoped Data)
    console.log('\n--- Step 4: Fetch Dashboard Stats ---');
    try {
        const statsRes = await axios.get(`${API_URL}/auth/agent/stats`, {
            headers: { Authorization: `Bearer ${APP_STATE.token}` }
        });
        console.log('✅ Stats Fetched:', statsRes.data);
    } catch (e: any) {
        console.error('❌ Step 4 Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // Step 5: Security Test (Attack from Unknown Device)
    console.log('\n--- Step 5: SECURITY TEST - Login from UNKNOWN Device ---');
    const attackerDeviceId = 'android_id_ATTACKER123';
    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: APP_STATE.email,
            password: 'NewAgentPass123!', // Even with correct password
            deviceId: attackerDeviceId // Different Device ID
        });
        console.error('❌ FAIL: Login should have been blocked!');
        process.exit(1);
    } catch (e: any) {
        if (e.response?.status === 401) {
            console.log('✅ SUCCESS: Login Blocked (401 Unauthorized) as expected.');
        } else {
            console.error('❌ FAIL: Unexpected error:', e.response?.data || e.message);
        }
    }

    console.log('\n🎉 ALL APP SIMULATION TESTS PASSED');
    console.log('-------------------------------------------------------');
    console.log('💡 MANUAL TEST INFO:');
    console.log('You can now use these credentials to login on the Emulator:');
    console.log(`📧 Email:    ${APP_STATE.email}`);
    console.log(`🔑 Password: NewAgentPass123!`);
    console.log('-------------------------------------------------------');
}

main();
