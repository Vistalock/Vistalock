import axios from 'axios';

const CUST_URL = 'http://localhost:3000/customers';

async function run() {
    try {
        console.log('1. Initiating Onboarding...');
        const phone = '08099998888';
        await axios.post(`${CUST_URL}/initiate`, { phoneNumber: phone });
        console.log('   - OTP Sent');

        console.log('2. Verifying OTP...');
        const verifyRes = await axios.post(`${CUST_URL}/verify`, { phoneNumber: phone, code: '123456' });
        const { userId } = verifyRes.data;
        console.log(`   - Verified! UserID: ${userId}`);

        console.log('3. Verifying ID (BVN)...');
        const idRes = await axios.post(`${CUST_URL}/verify-id`, {
            userId,
            type: 'BVN',
            value: '22222222222'
        });
        console.log('   - ID Verified:', idRes.data.firstName);

        console.log('4. Checking Credit...');
        const creditRes = await axios.post(`${CUST_URL}/credit-check`, {
            userId,
            bvn: '22222222222'
        });
        console.log('   - Credit Result:', creditRes.data);

        if (creditRes.data.qualified) {
            console.log('SUCCESS: Customer Qualified and Verified!');
        } else {
            console.log('WARNING: Customer Declined (low score)');
        }

    } catch (e: any) {
        console.error('FAILED:', e.response?.data || e.message);
        process.exit(1);
    }
}

run();
