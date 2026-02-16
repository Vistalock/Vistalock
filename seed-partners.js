
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env
const envPath = path.resolve(__dirname, 'packages/database/.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Loan Partners (Robust Mode)...');

    const salt = await bcrypt.genSalt(10);
    const hashedSecret = await bcrypt.hash('partner_secret_123', salt);

    // 1. Moniepoint
    try {
        const moniepoint = await prisma.loanPartner.upsert({
            where: { apiKey: 'vl_live_sk_moniepoint_TEST' },
            update: {
                apiSecret: hashedSecret // Ensure secret is up to date
            },
            create: {
                name: 'Moniepoint',
                slug: 'moniepoint',
                description: 'Banking for businesses.',
                apiKey: 'vl_live_sk_moniepoint_TEST',
                apiSecret: hashedSecret,
                webhookSecret: 'whsec_moniepoint_TEST',
                minDownPaymentPct: 20.0,
                maxTenure: 12,
                isActive: true,
                supportedRepaymentTypes: ['MONTHLY', 'WEEKLY']
            }
        });
        console.log(`✅ Upserted Partner: ${moniepoint.name} (${moniepoint.id})`);

        // Check/Link Merchant if needed
        let merchantId = moniepoint.merchantId;
        if (!merchantId) {
            const user = await prisma.user.findFirst({ where: { role: 'MERCHANT' } });
            if (user) {
                await prisma.loanPartner.update({
                    where: { id: moniepoint.id },
                    data: { merchantId: user.id }
                });
                console.log(`  Linked to Merchant: ${user.email}`);
                merchantId = user.id;
            } else {
                console.log('  ⚠️ No MERCHANT found to link. Products API might return empty.');
            }
        }

        // 2. Flexibank
        await prisma.loanPartner.upsert({
            where: { apiKey: 'vl_live_sk_flexibank_TEST' },
            update: { apiSecret: hashedSecret },
            create: {
                name: 'Flexibank',
                slug: 'flexibank',
                description: 'Flexible digital financing.',
                apiKey: 'vl_live_sk_flexibank_TEST',
                apiSecret: hashedSecret,
                webhookSecret: 'whsec_flexibank_TEST',
                minDownPaymentPct: 30.0,
                maxTenure: 6,
                isActive: true,
                supportedRepaymentTypes: ['MONTHLY']
            }
        });
        console.log(`✅ Upserted Partner: Flexibank`);

    } catch (e) {
        console.error('❌ Failed to upsert partners:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
