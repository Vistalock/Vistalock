// Fix merchant creation by verifying current state and forcing a reset
require('dotenv').config();

const { PrismaClient } = require('@vistalock/database');
const bcrypt = require('bcrypt');

console.log('Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@') : 'UNDEFINED');

const prisma = new PrismaClient();

async function fixMerchant() {
    console.log('\n🔧 Fixing Merchant Account (Clean Slate)...\n');

    const email = 'merchant-a@test.com';
    const password = 'Test123!@#$%';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        console.log(`Checking for existing user: ${email}`);
        const existing = await prisma.user.findUnique({
            where: { email },
            include: { merchantProfile: true }
        });

        if (existing) {
            console.log(`Found existing user ID: ${existing.id}. Deleting...`);
            // Delete the user (cascade should handle profile, but just in case)
            await prisma.user.delete({
                where: { email }
            });
            console.log('✅ Deleted existing user.');
        } else {
            console.log('No existing user found.');
        }

        console.log('Creating fresh merchant account...');
        const merchant = await prisma.user.create({
            data: {
                email,
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
        console.log(`✅ Merchant created successfully: ${merchant.id}`);

        // Verify immediately
        const verify = await prisma.user.findUnique({
            where: { email },
            include: { merchantProfile: true }
        });

        console.log('\nVerification Check:');
        console.log('User ID:', verify.id);
        console.log('Email:', verify.email);
        console.log('Role:', verify.role);
        console.log('Merchant Profile:', verify.merchantProfile ? '✅ Exists' : '❌ Missing');

    } catch (error) {
        console.error('\n❌ Error fixing merchant:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fixMerchant();
