// Create a BRAND NEW merchant to guarantee no conflicts
require('dotenv').config();

const { PrismaClient } = require('@vistalock/database');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFreshMerchant() {
    console.log('\n🔧 Creating Fresh Merchant (Schema Aligned)...\n');

    const email = 'merchant-test-new@vistalock.com';
    const password = 'Test123!@#$%';
    const phone = '+2348033333333';

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Delete if exists first
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('Deleting existing user...');
            await prisma.user.delete({ where: { email } });
        }
    } catch (e) {
        console.log('Error deleting existing (ignoring):', e.message);
    }

    try {
        const merchant = await prisma.user.create({
            data: {
                email,
                password: hash,
                role: 'MERCHANT',
                merchantProfile: {
                    create: {
                        businessName: 'Fresh Tech Store',
                        businessAddress: '1 New St, Lagos',
                        businessType: 'SOLE_PROPRIETORSHIP',
                        rcNumber: 'RC-' + Date.now(), // Unique RC
                        directorName: 'New Merchant Director',
                        directorPhone: phone,
                        maxDevices: 100,
                        maxAgents: 10,
                    }
                }
            }
        });
        console.log(`✅ Merchant created: ${merchant.id}`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

    } catch (error) {
        console.error('❌ Error creating fresh merchant:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

createFreshMerchant();
