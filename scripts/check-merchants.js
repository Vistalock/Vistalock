// Check if merchants exist in database
const { PrismaClient } = require('@vistalock/database');

const prisma = new PrismaClient();

async function checkMerchants() {
    console.log('🔍 Checking merchants in database...\n');

    const merchants = await prisma.user.findMany({
        where: {
            email: {
                in: ['merchant-a@test.com', 'merchant-b@test.com']
            }
        },
        select: {
            id: true,
            email: true,
            role: true,
            password: true,
            merchantProfile: true
        }
    });

    console.log(`Found ${merchants.length} merchants:\n`);
    merchants.forEach(m => {
        console.log(`Email: ${m.email}`);
        console.log(`Role: ${m.role}`);
        console.log(`Has Password: ${m.password ? 'Yes' : 'No'}`);
        console.log(`Has Profile: ${m.merchantProfile ? 'Yes' : 'No'}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

checkMerchants().catch(console.error);
