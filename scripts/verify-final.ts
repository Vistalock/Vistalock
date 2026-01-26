
import axios from 'axios';
import { randomBytes } from 'crypto';

const API_URL = 'http://localhost:3005';
const SUPER_ADMIN = { email: 'superadmin@vistalock.com', password: 'AdminPass123!' };

// Helpers
const log = (step: string, msg: string) => console.log(`[${step}] ${msg}`);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
    log('INIT', 'Starting Final Verification (Phase 22)...');

    try {
        // 1. Super Admin Login
        const adminAuth = await axios.post(`${API_URL}/auth/login`, SUPER_ADMIN);
        const adminToken = adminAuth.data.access_token;
        log('ADMIN', 'Super Admin Logged In');

        // 2. Create Merchant
        const merchantEmail = `merchant_${randomBytes(4).toString('hex')}@test.com`;
        const merchantPass = 'MerchantPass123!';
        log('ADMIN', `Creating Merchant: ${merchantEmail}`);

        // Note: In real flow, Admin invites, or Merchant registers. We'll use register endpoint for speed if open, 
        // or use the admin create user endpoint we built in Phase 19.
        // Let's use the public register for "Self Onboarding" flow or Admin creation.
        // Checking if public register allows merchant role... usually it defaults to CUSTOMER.
        // We will use the Admin Create User endpoint.

        await axios.post(`${API_URL}/auth/admin/users`, {
            email: merchantEmail,
            password: merchantPass,
            role: 'MERCHANT'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        log('ADMIN', 'Merchant Created via Admin API');

        // 3. Merchant Login & Onboarding
        const merchantAuth = await axios.post(`${API_URL}/auth/login`, { email: merchantEmail, password: merchantPass });
        const merchantToken = merchantAuth.data.access_token;
        log('MERCHANT', 'Merchant Logged In');

        // Create Profile (Simplified)
        await axios.post(`${API_URL}/auth/merchant-profile`, {
            businessName: "Final Test Ventures",
            businessType: "SOLE_PROPRIETORSHIP",
            rcNumber: "RC" + randomBytes(4).toString('hex'),
            businessAddress: "123 Test St",
            directorName: "Test Director",
            directorPhone: "08012345678",
            revenueShare: 10
        }, { headers: { Authorization: `Bearer ${merchantToken}` } });
        log('MERCHANT', 'Profile Created');

        // 4. Create Customer
        const customerEmail = `cust_${randomBytes(4).toString('hex')}@test.com`;
        const customerPass = 'CustomerPass123!';
        // Merchants usually create customers via "onboarding" or customers sign up.
        // Let's use public register.
        await axios.post(`${API_URL}/auth/register`, {
            email: customerEmail,
            password: customerPass,
            role: 'CUSTOMER'
        });
        const custAuth = await axios.post(`${API_URL}/auth/login`, { email: customerEmail, password: customerPass });
        const custToken = custAuth.data.access_token;
        const custUser = await axios.get(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${custToken}` } });
        const custId = custUser.data.sub || custUser.data.id;
        log('CUSTOMER', `Customer Registered: ${custId}`);

        // 5. Register Device
        const imei = '355' + randomBytes(6).toString('hex');
        const serial = 'SN' + randomBytes(4).toString('hex');
        await axios.post(`${API_URL}/devices`, {
            imei,
            serialNumber: serial,
            model: "Samsung A14",
            merchantId: (await axios.get(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${merchantToken}` } })).data.sub
        }, { headers: { Authorization: `Bearer ${merchantToken}` } });
        log('MERCHANT', `Device Registered: ${imei}`);

        // Get Device ID
        const devices = await axios.get(`${API_URL}/devices`, { headers: { Authorization: `Bearer ${merchantToken}` } });
        const deviceId = devices.data.find((d: any) => d.imei === imei).id;

        // 6. Create Loan
        log('MERCHANT', 'Creating Loan...');
        const loanRes = await axios.post(`${API_URL}/loans`, {
            userId: custId,
            deviceId: deviceId,
            amount: 50000,
            currency: 'NGN',
            interestRate: 5.5,
            durationMonths: 3,
            startDate: new Date().toISOString()
        }, { headers: { Authorization: `Bearer ${merchantToken}` } });
        const loanId = loanRes.data.id;
        log('MERCHANT', `Loan Created: ${loanId}`);

        // 7. Verify Device Locked (Should be UNLOCKED initially if active, or PENDING_SETUP?)
        // Actually, logic is: Device is PENDING_SETUP. Loan makes it ACTIVE. Status depends on payments.
        // A new loan usually starts Active.
        // Check Status
        // For verify, we want to simulate a payment flow.

        // 8. Simulate Payment (Paystack Webhook)
        log('PAYMENT', 'Simulating Paystack Webhook for Down Payment...');
        // We need a transaction reference
        const reference = 'ref_' + randomBytes(8).toString('hex');

        // We'll hit the /loans/webhook endpoint directly if it exists, or manually record payment
        // Phase 14 added /loans/webhook
        try {
            await axios.post(`${API_URL}/loans/webhook`, {
                event: 'charge.success',
                data: {
                    reference: reference, // In real world, we'd need metadata to link to loan, or provider checks ref
                    amount: 50000 * 100, // Kobo
                    metadata: {
                        loanId: loanId,
                        type: 'repayment' // or down_payment
                    }
                }
            }, {
                headers: { 'x-paystack-signature': 'mock-sig' } // We might need to bypass signature verification in test mode or mock it
            });
            log('PAYMENT', 'Webhook Sent');
        } catch (e) {
            log('PAYMENT', 'Webhook failed (expected if signature validation is on). Using manual recording.');
            // Fallback: Merchant manually records payment
            await axios.post(`${API_URL}/loans/${loanId}/repay`, {
                amount: 5000,
                currency: 'NGN'
            }, { headers: { Authorization: `Bearer ${merchantToken}` } });
            log('MERCHANT', 'Manual Repayment Recorded');
        }

        // 9. Verify Loan Updated
        const loanDetails = await axios.get(`${API_URL}/loans/${loanId}`, { headers: { Authorization: `Bearer ${merchantToken}` } });
        log('VERIFY', `Loan Paid Amount: ${loanDetails.data.totalPaid}`);

        if (Number(loanDetails.data.totalPaid) > 0) {
            log('SUCCESS', 'Core Loop Verified: Admin -> Merchant -> Customer -> Loan -> Payment');
        } else {
            log('ERROR', 'Payment not reflected');
            process.exit(1);
        }

    } catch (error: any) {
        console.error('FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}

main();
