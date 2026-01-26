import axios from 'axios';
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// Using Gateway URLs
const LOAN_SERVICE_URL = 'http://localhost:3003'; // Direct port for manual trigger? Or Gateway? 
// Gateway doesn't expose /enforcement/trigger unless I add it to gateway routes.
// The new controller is in Loan Service. Gateway config only forwards specific routes if not wildcard.
// api-gateway main.ts usually forwards /loans to loan-service. 
// I probably didn't update gateway to forward /enforcement.
// So I will hit loan-service directly on 3003.

async function run() {
    console.log('1. Setting up Test Data (Overdue Loan)...');

    // Find an active loan or create one?
    // Let's find any active loan and make its first pending installment overdue.
    let installment = await prisma.installment.findFirst({
        where: { status: 'PENDING', loan: { status: 'ACTIVE' } },
        include: { loan: { include: { device: true } } }
    });

    if (!installment) {
        console.log('No eligible installment found. Please create a loan first via Dashboard.');
        process.exit(1);
    }

    console.log(`Targeting Installment ${installment.id} (Loan ${installment.loanId})`);
    console.log(`Device IMEI: ${installment.loan.device.imei}`);

    // Time Travel: Set dueDate to Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.installment.update({
        where: { id: installment.id },
        data: { dueDate: yesterday }
    });
    console.log('Updated Installment Due Date to Yesterday.');

    // Trigger Enforcement
    console.log('2. Triggering Enforcement Job...');
    try {
        await axios.post(`${LOAN_SERVICE_URL}/enforcement/trigger`);
        console.log('Triggered.');
    } catch (e: any) {
        console.error('Trigger Failed:', e.message);
        // It might be 404 if my controller isn't picked up?
    }

    // Wait for async processing? The controller awaits the service so it should be synchronous.

    // Verify Result
    console.log('3. Verifying Results...');

    const updatedInstallment = await prisma.installment.findUnique({
        where: { id: installment.id }
    });

    const updatedDevice = await prisma.device.findUnique({
        where: { id: installment.loan.deviceId }
    });

    console.log('Installment Status:', updatedInstallment?.status); // Expected: OVERDUE
    console.log('Device Status:', updatedDevice?.status);           // Expected: LOCKED

    if (updatedInstallment?.status === 'OVERDUE' && updatedDevice?.status === 'LOCKED') {
        console.log('SUCCESS: Automation Logic Verified.');
    } else {
        console.log('FAILURE: State did not update as expected.');
    }

    await prisma.$disconnect();
}

run();
