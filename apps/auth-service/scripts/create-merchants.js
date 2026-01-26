// Create merchants properly with correct schema
const { PrismaClient } = require('@vistalock/database');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createMerchants() {
    console.log('🔧 Creating merchants...\n');

    const password = 'Test123!@#$%';
    const hash = await bcrypt.hash(password, 10);

    // Merchant A
    try {
        const merchantA = await prisma.user.create({
            data: {
                email: 'merchant-a@test.com',
                password: hash,
                role: 'MERCHANT',
                merchantProfile: {
                    create: {
                        businessName: 'Tech Store A',
                        businessAddress: '123 Tech Street, Lagos',
                        contactPerson: 'John Merchant',
                        phoneNumber: '+2348011111111',
                        maxDevices: 100,
                        maxAgents: 10,
                    }
                }
            }
        });
        console.log('✅ Merchant A created:', merchantA.email);
    } catch (e) {
        console.log('⚠️  Merchant A:', e.message);
    }

    // Merchant B
    try {
        const merchantB = await prisma.user.create({
            data: {
                email: 'merchant-b@test.com',
                password: hash,
                role: 'MERCHANT',
                merchantProfile: {
                    create: {
                        businessName: 'Electronics Hub B',
                        businessAddress: '456 Electronics Ave, Abuja',
                        contactPerson: 'Jane Merchant',
                        phoneNumber: '+2348022222222',
                        maxDevices: 100,
                        maxAgents: 10,
                    }
                }
            }
        });
        console.log('✅ Merchant B created:', merchantB.email);
    } catch (e) {
        console.log('⚠️  Merchant B:', e.message);
    }

    console.log('\n📋 Credentials:');
    console.log('   Email: merchant-a@test.com / merchant-b@test.com');
    console.log('   Password: Test123!@#$%');
    console.log('\n✅ Done!\n');

    await prisma.$disconnect();
}

createMerchants().catch(console.error);
