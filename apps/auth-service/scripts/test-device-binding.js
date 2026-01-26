const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function testDeviceBinding() {
    console.log('🔒 Testing Device Binding Security...');

    // 1. Get the Agent and their actual Device ID from DB
    // We need to initialize Prisma just for this check (or use hardcoded if we knew it)
    // But since the web generated a random UUID, we MUST fetch it.

    // Note: This script assumes it can connect to DB. 
    // If not, we might need to rely on the user telling us, but automation is better.

    const prisma = new PrismaClient();
    let agentEmail = 'test-agent-new@vistalock.com'; // Adjust if needed? 
    // Wait, the user created agent with phone +2347049159042
    // The email was optional: "andrewoigure@gmail.com" (from screenshot Step 3399)
    agentEmail = 'andrewoigure@gmail.com';

    try {
        const user = await prisma.user.findUnique({
            where: { email: agentEmail },
            include: { agentProfile: true }
        });

        if (!user || !user.agentProfile) {
            console.error('❌ Agent not found in DB. Did you create "andrewoigure@gmail.com"?');
            return;
        }

        const realDeviceId = user.agentProfile.deviceId;
        console.log(`✅ Found Agent: ${user.email}`);
        console.log(`📱 Bound Device ID: ${realDeviceId}`);

        const API_URL = 'http://localhost:3001/auth/login';
        const PASSWORD = 'Test123!@#$%'; // Wait, user set a password in Activate Page.
        // The user set "Min. 12 characters".
        // In Step 3436, user saw "Set Password & Activate".
        // I don't know the password the user typed.
        // Hmmm. I cannot login if I don't know the password.

        // OPTION 1: Use a "Sudo" login or reset password? No, that breaks the flow.
        // OPTION 2: Just use the endpoint with a WRONG password and see if Device Check happens BEFORE password validation?
        // Checking AuthController: 
        // `user = validateUser(email, password)` happens FIRST.
        // So I MUST know the password.

        // Problem: I don't know the password user set.
        // Is there a default? No.

        // Workaround: I will reset the password using Prisma for this test, 
        // OR create a NEW agent purely for testing via script.

        // I will Create a NEW Agent via script, Activate it via script (setting known password), and THEN test login.
        // This is cleaner and doesn't mess with User's manual agent.

        console.log('\n--- Creating Test Agent & Device ---');
        // Actually, let's just create a new User directly in DB to bypass Auth barriers for test setup.
        const testAgentEmail = `security-test-${Date.now()}@vistalock.com`;
        const testPass = 'SecurityTest123!';
        // We'll need bcrypt? Or just hit the 'register' endpoint?
        // Register endpoint creates CUSTOMER usually.
        // CreateAgent endpoint requires Merchant Token.

        // Let's use the EXISTING Merchant credentials to create an agent.
        // Merchant: merchant-test-new@vistalock.com / Test123!@#$%

        // 1. Login as Merchant
        const merchantLogin = await axios.post(API_URL, {
            email: 'merchant-test-new@vistalock.com',
            password: 'Test123!@#$%'
        });
        const merchantToken = merchantLogin.data.access_token;
        console.log('✅ Merchant Logged In');

        // 2. Create Agent
        const agentPhone = `+234${Math.floor(Math.random() * 1000000000)}`;
        const createRes = await axios.post('http://localhost:3001/agents', {
            fullName: 'Security Test Agent',
            phoneNumber: agentPhone,
            email: testAgentEmail,
            branch: 'Test Lab',
            onboardingLimit: 5
        }, { headers: { Authorization: `Bearer ${merchantToken}` } });

        console.log(`✅ Test Agent Created: ${testAgentEmail}`);

        // 3. Get Activation Token (from DB, since we can't read SMS easily here)
        const agentUser = await prisma.user.findUnique({
            where: { email: testAgentEmail },
            include: { agentProfile: true }
        });
        const token = agentUser.agentProfile.activationToken;
        const testDeviceId = 'device-123-secure';

        // 4. Activate Agent
        await axios.post('http://localhost:3001/agents/activate', {
            token: token,
            password: testPass,
            deviceId: testDeviceId
        });
        console.log(`✅ Agent Activated with Device: ${testDeviceId}`);

        // 5. TEST SCENARIOS

        console.log('\n--- STARTING SECURITY CHECKS ---');

        // A. Missing Device ID
        try {
            await axios.post(API_URL, {
                email: testAgentEmail,
                password: testPass
                // No deviceId
            });
            console.error('❌ FAIL: Login succeeded without deviceId!');
        } catch (e) {
            if (e.response?.status === 401 && e.response?.data?.message.includes('Device ID is required')) {
                console.log('✅ SUCCESS: Blocked login without deviceId');
            } else {
                console.log(`⚠️ Unexpected Error: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
            }
        }

        // B. Wrong Device ID
        try {
            await axios.post(API_URL, {
                email: testAgentEmail,
                password: testPass,
                deviceId: 'hacker-device-999'
            });
            console.error('❌ FAIL: Login succeeded with WRONG deviceId!');
        } catch (e) {
            if (e.response?.status === 401 && e.response?.data?.message.includes('Device Access Denied')) {
                console.log('✅ SUCCESS: Blocked login with wrong deviceId');
            } else {
                console.log(`⚠️ Unexpected Error: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
            }
        }

        // C. Correct Device ID
        try {
            const res = await axios.post(API_URL, {
                email: testAgentEmail,
                password: testPass,
                deviceId: testDeviceId
            });
            if (res.status === 200 || res.status === 201) {
                console.log('✅ SUCCESS: Login allowed with correct deviceId');
            }
        } catch (e) {
            console.error('❌ FAIL: Valid login was blocked!', e.message);
        }

    } catch (err) {
        console.error('❌ Script Error:', err.message);
        if (err.response) console.error('API Response:', err.response.data);
    } finally {
        await prisma.$disconnect();
    }
}

testDeviceBinding();
