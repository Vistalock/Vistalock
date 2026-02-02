
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Test Loan Partners...');

    // 1. Moniepoint
    const moniepoint = await prisma.loanPartner.upsert({
        where: { slug: 'moniepoint' },
        update: {},
        create: {
            name: 'Moniepoint',
            slug: 'moniepoint',
            description: 'Banking for businesses.',
            baseUrl: 'https://api-staging.moniepoint.com/v1',
            apiKey: 'vl_live_sk_moniepoint_TEST', // Predictable Key for Testing
            webhookSecret: 'whsec_moniepoint_TEST',
            minDownPaymentPct: 20.0,
            maxTenure: 12,
            isActive: true,
            supportedRepaymentTypes: ['MONTHLY', 'WEEKLY']
        }
    });
    console.log(`✅ Created/Found Partner: Moniepoint (ID: ${moniepoint.id})`);
    console.log(`   🔑 API Key: vl_live_sk_moniepoint_TEST`);

    // 2. Flexibank
    const flexibank = await prisma.loanPartner.upsert({
        where: { slug: 'flexibank' },
        update: {},
        create: {
            name: 'Flexibank',
            slug: 'flexibank',
            description: 'Flexible digital financing.',
            baseUrl: 'https://api.flexibank.com/v2',
            apiKey: 'vl_live_sk_flexibank_TEST',
            webhookSecret: 'whsec_flexibank_TEST',
            minDownPaymentPct: 30.0,
            maxTenure: 6,
            isActive: true,
            supportedRepaymentTypes: ['MONTHLY']
        }
    });
    console.log(`✅ Created/Found Partner: Flexibank (ID: ${flexibank.id})`);
    console.log(`   🔑 API Key: vl_live_sk_flexibank_TEST`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
