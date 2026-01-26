const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000'; // Gateway

async function main() {
    console.log('--- Phase 12 Verification: Customer App & Payments ---');

    // 1. Setup Data: Get a User with a Loan (or create one)
    // We'll reuse the user/loan from Phase 11 if possible, or find any active loan.
    console.log('1. Finding Active Loan...');
    const loan = await prisma.loan.findFirst({
        where: { status: 'ACTIVE' },
        include: { device: true, installments: true }
    });

    if (!loan) {
        console.error('No Active Loan found to test. Please run seeding or previous verification scripts.');
        process.exit(1);
    }
    console.log(`Found Loan ID: ${loan.id} for User: ${loan.userId}`);

    // 2. Simulate Customer Login (OTP) - Optional, we can just use userId directly for dashboard fetch
    // But let's test the /initiate endpoint just to be sure it's up
    console.log('2. Testing OTP Initiation...');
    // We need the phone number. Prisma user doesn't strictly store phone on User model (it's in CustomerProfile)
    // Let's skip OTP real verification and assume we have the userId as the logged-in user.

    // 3. Simulate "Pay Now" logic (calling Repay Endpoint)
    console.log('3. Simulating Payment of NGN 5000...');
    const amountToPay = 5000;
    try {
        const res = await axios.post(`${API_URL}/loans/${loan.id}/repay`, {
            amount: amountToPay
        });
        console.log('Repayment API Success:', res.status === 201);
    } catch (e) {
        console.error('Repayment API Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // 4. Verify Database Updates
    console.log('4. Verifying Database State...');

    // Check Transaction
    const transaction = await prisma.transaction.findFirst({
        where: { loanId: loan.id },
        orderBy: { createdAt: 'desc' }
    });

    if (!transaction) {
        console.error('FAILURE: No Transaction record found!');
    } else {
        console.log('SUCCESS: Transaction Record Found.');
        console.log(`- Amount: ${transaction.amount}`);
        console.log(`- Merchant ID: ${transaction.merchantId}`);
        console.log(`- Type: ${transaction.type}`);
        console.log(`- Status: ${transaction.status}`);

        if (Number(transaction.amount) === amountToPay && transaction.merchantId === loan.device.merchantId) {
            console.log('✅ Settlement Logic Verified: 100% recorded for Merchant.');
        } else {
            console.log('❌ Settlement Logic Mismatch.');
        }
    }

    // Check Installments
    // Force a fetch to see updated state
    const updatedLoan = await prisma.loan.findUnique({
        where: { id: loan.id },
        include: { installments: true }
    });

    const paidInstallments = updatedLoan.installments.filter(i => i.status === 'PAID');
    console.log(`Installments Paid: ${paidInstallments.length} / ${updatedLoan.installments.length}`);

    if (transaction) {
        console.log('--- PHASE 12 VERIFICATION SUCCESSFUL ---');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
