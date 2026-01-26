import { PrismaClient } from '@vistalock/database';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Creating test merchants...\n');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Test123!', salt);

    // Merchant A
    try {
        const merchantA = await prisma.user.upsert({
            where: { email: 'merchant-a@test.com' },
            update: {},
            create: {
                email: 'merchant-a@test.com',
                password: password,
                role: 'MERCHANT',
                merchantProfile: {
                    create: {
                        businessName: 'Tech Store A',
                        businessAddress: '123 Tech Street, Lagos',
                        contactPerson: 'John Merchant',
                        phoneNumber: '+2348011111111',
                        maxDevices: 100,
                        maxAgents: 10,
                    },
                },
            },
        });
        console.log('✅ Merchant A created:', merchantA.email);
    } catch (e) {
        console.log('⚠️  Merchant A already exists or error:', e.message);
    }

    // Merchant B
    try {
        const merchantB = await prisma.user.upsert({
            where: { email: 'merchant-b@test.com' },
            update: {},
            create: {
                email: 'merchant-b@test.com',
                password: password,
                role: 'MERCHANT',
                merchantProfile: {
                    create: {
                        businessName: 'Electronics Hub B',
                        businessAddress: '456 Electronics Ave, Abuja',
                        contactPerson: 'Jane Merchant',
                        phoneNumber: '+2348022222222',
                        maxDevices: 100,
                        maxAgents: 10,
                    },
                },
            },
        });
        console.log('✅ Merchant B created:', merchantB.email);
    } catch (e) {
        console.log('⚠️  Merchant B already exists or error:', e.message);
    }

    console.log('\n📋 Test Credentials:');
    console.log('   Email: merchant-a@test.com / merchant-b@test.com');
    console.log('   Password: Test123!');
    console.log('\n✅ Setup complete! Ready for E2E testing.\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
