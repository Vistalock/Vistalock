
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, 'packages/database/.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for LOAN PARTNER...');
    try {
        const partner = await prisma.loanPartner.findFirst({
            where: {
                apiKey: 'vl_live_sk_moniepoint_TEST'
            }
        });

        if (partner) {
            console.log('✅ PARTNER EXISTS:', partner.name, partner.id);
            console.log('API Key verified.');
            // Check products for merchant
            if (partner.merchantId) {
                const products = await prisma.product.findMany({
                    where: { merchantId: partner.merchantId }
                });
                console.log(`✅ Merchant has ${products.length} products.`);
            } else {
                console.log('❌ Partner has no merchant linked.');
            }
        } else {
            console.log('❌ PARTNER NOT FOUND. Seeding is required.');
        }

    } catch (e) {
        console.error('❌ Check Failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
