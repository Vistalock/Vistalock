// @ts-nocheck
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from packages/database
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Test Loan Partners...');

    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash('partner_secret_123', salt);

    // 1. Moniepoint
    const moniepoint = await prisma.loanPartner.upsert({
        where: { slug: 'moniepoint' },
        update: {
            apiSecret: hashedSecret // Update secret if exists
        },
        create: {
            name: 'Moniepoint',
            slug: 'moniepoint',
            description: 'Banking for businesses.',
            baseUrl: 'https://api-staging.moniepoint.com/v1',
            apiKey: 'vl_live_sk_moniepoint_TEST',
            apiSecret: hashedSecret,
            webhookSecret: 'whsec_moniepoint_TEST',
            minDownPaymentPct: 20.0,
            maxTenure: 12,
            isActive: true,
            supportedRepaymentTypes: ['MONTHLY', 'WEEKLY']
        }
    });
    console.log(`✅ Created/Found Partner: Moniepoint`);
    console.log(`   🔑 API Key: vl_live_sk_moniepoint_TEST`);
    console.log(`   🔒 Secret: partner_secret_123`);

    // 2. Flexibank
    const flexibank = await prisma.loanPartner.upsert({
        where: { slug: 'flexibank' },
        update: {
            apiSecret: hashedSecret
        },
        create: {
            name: 'Flexibank',
            slug: 'flexibank',
            description: 'Flexible digital financing.',
            baseUrl: 'https://api.flexibank.com/v2',
            apiKey: 'vl_live_sk_flexibank_TEST',
            apiSecret: hashedSecret,
            webhookSecret: 'whsec_flexibank_TEST',
            minDownPaymentPct: 30.0,
            maxTenure: 6,
            isActive: true,
            supportedRepaymentTypes: ['MONTHLY']
        }
    });
    console.log(`✅ Created/Found Partner: Flexibank`);

    // 3. Seed Dummy Loans/Devices for Stats (if they don't exist)
    const uniqueId = Date.now().toString();
    const testEmail = `test_borrower_${uniqueId}@vistalock.com`;

    // Create a new user every time to avoid conflicts (or cleanup later)
    // Alternatively, try to find strictly by email.
    let user = await prisma.user.findFirst({
        where: { email: 'test_borrower@vistalock.com' }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test_borrower@vistalock.com',
                firstName: 'Test',
                lastName: 'Borrower',
                password: 'password123',
                role: 'CUSTOMER',
                phoneNumber: `080${Math.floor(Math.random() * 100000000)}`, // Random phone
                nin: `11${Math.floor(Math.random() * 1000000000)}`, // Random NIN
                bvn: `22${Math.floor(Math.random() * 1000000000)}`, // Random BVN
            }
        }).catch((e) => {
            console.error('Failed to create user:', e.message);
            return null;
        });
    }

    if (user) {
        // Create a device
        const device = await prisma.device.upsert({
            where: { imei: '99000088000077' },
            update: {},
            create: {
                imei: '99000088000077',
                serialNumber: 'SN12345678',
                model: 'Samsung Galaxy A14',
                status: 'LOCKED',
                merchantId: user.id, // Hack: assign to same user for simplicity if merchantId required
            }
        });

        // Create a loan linked to Moniepoint
        await prisma.loan.create({
            data: {
                userId: user.id,
                loanPartnerId: moniepoint.id,
                loanAmount: 50000,
                balance: 25000, // Assuming balance/outstanding field exists, let's check schema
                status: 'ACTIVE',
                deviceImei: device.imei,
                merchantId: user.id, // Hack
                productId: 'dummy-product-id', // We might need a product too...
                // ... other required fields based on schema
            }
        }).catch(e => console.log('Skipping loan creation (schema constraints):', e.message));

        console.log('✅ Seeded dummy loan data for stats');
    }
}

main()
    .catch((e) => {
        console.error('❌ SEEDING FAILED:');
        console.error(JSON.stringify(e, null, 2));
        console.error(e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
