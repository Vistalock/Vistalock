
import axios from 'axios';
import * as crypto from 'crypto';

const API = 'http://localhost:3000'; // Gateway
const PAYSTACK_SECRET = 'secret'; // Mock secret

async function verifyPhase14() {
    console.log('--- Starting Phase 14 Verification ---');

    // 1. Enroll a Device (Simulate Mobile App)
    console.log('\n1. Enrolling Device...');
    const imei = 'ANDROID_DEVICE_TEST_' + Date.now();
    const userId = 'user-uuid-123'; // Logic needs real user?
    // We need a real user ID. Let's create one or assume seed data.
    // Actually, enrollDevice checks valid Device. So we must register one first.
    // We can use the admin endpoint to register.

    // 1a. Register Device (Admin)
    try {
        await axios.post(`${API}/devices`, {
            imei: imei,
            merchantId: 'merchant-uuid-123', // Need valid merchant
            // Actually, let's use the seed merchant if possible.
            // Or skip this if we can't look up IDs easily without login.
        });
    } catch (e) {
        // Might fail if Auth required.
        // Let's assume we can just use the Service directly? No, verification script runs from outside.
        // If Auth is on, we need login.
        console.log('Skipping Device Registration (Assumed Pre-existing or Auth required). using Mock IMEI if possible.');
    }

    // 1b. Call Enroll
    try {
        // Enrolling a non-existent device will fail. 
        // We really need a VALID device.
        // Let's try to fetch all devices and pick one.
        const devices = await axios.get(`${API}/devices`);
        if (devices.data.length > 0) {
            const device = devices.data[0];
            console.log(`Using existing device: ${device.imei}`);

            // Call Enroll
            await axios.post(`${API}/devices/enroll`, {
                imei: device.imei,
                userId: 'some-user-id',
                token: 'mock-token'
            });
            console.log('Enrollment Successful!');
        } else {
            console.log('No devices found to enroll.');
        }

    } catch (e) {
        console.error('Enrollment Failed:', e.message);
    }

    // 2. Simulate Payment Webhook
    console.log('\n2. Simulating Paystack Webhook...');
    const payload = {
        event: 'charge.success',
        data: {
            reference: 'REF-' + Date.now(),
            amount: 500000, // 5000 NGN
            metadata: {
                loanId: 'some-loan-id' // We need a valid Loan ID
            }
        }
    };

    // Calculate Signature
    // If ConfigService uses default secret, we need to match it.
    // If we didn't set PAYSTACK_SECRET_KEY in docker-compose, it might be undefined or empty or default.
    // Let's guess 'secret' or empty.

    // We need a valid Loan ID to avoid "Webhook Error: Missing loanId".
    // Let's fetch loans.
    try {
        const loans = await axios.get(`${API}/loans`);
        if (loans.data.length > 0) {
            payload.data.metadata.loanId = loans.data[0].id;
            console.log(`Using Loan ID: ${payload.data.metadata.loanId}`);

            const signature = crypto.createHmac('sha512', 'secret').update(JSON.stringify(payload)).digest('hex');

            await axios.post(`${API}/loans/webhook`, payload, {
                headers: { 'x-paystack-signature': signature }
            });
            console.log('Webhook Sent Successfully!');
        } else {
            console.log('No loans found to pay.');
        }
    } catch (e) {
        console.error('Webhook verification failed', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verifyPhase14();
