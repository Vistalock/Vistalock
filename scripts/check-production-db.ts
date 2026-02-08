import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function inspectAndCleanup() {
    try {
        console.log('🔍 Connecting to production database...\n');

        // 1. Find the merchant application
        console.log('📋 Looking for Test Electronics application...');
        const application = await prisma.merchantApplication.findFirst({
            where: {
                email: 'andrewoigure@gmail.com'
            }
        });

        if (!application) {
            console.log('❌ No application found for andrewoigure@gmail.com');
            return;
        }

        console.log('✅ Found application:');
        console.log('   ID:', application.id);
        console.log('   Business:', application.businessName);
        console.log('   Email:', application.email);
        console.log('   Status:', application.status);
        console.log('   CAC Number:', application.cacNumber || 'N/A');

        const tempRcNumber = `TEMP-${application.id.substring(0, 8)}`;
        console.log('   Expected RC Number:', tempRcNumber);
        console.log('');

        // 2. Check for existing user
        console.log('👤 Checking for existing user...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'andrewoigure@gmail.com' },
            include: { merchantProfile: true }
        });

        if (existingUser) {
            console.log('⚠️  Found existing user:');
            console.log('   User ID:', existingUser.id);
            console.log('   Email:', existingUser.email);
            console.log('   Role:', existingUser.role);
            console.log('   Has Password:', existingUser.password ? 'Yes' : 'No');

            if (existingUser.merchantProfile) {
                console.log('   Merchant Profile ID:', existingUser.merchantProfile.id);
                console.log('   Business Name:', existingUser.merchantProfile.businessName);
                console.log('   RC Number:', existingUser.merchantProfile.rcNumber);
                console.log('   Status:', existingUser.merchantProfile.status);
            }
            console.log('');

            // Delete existing user and profile
            console.log('🗑️  Deleting existing user and merchant profile...');

            if (existingUser.merchantProfile) {
                await prisma.merchantProfile.delete({
                    where: { id: existingUser.merchantProfile.id }
                });
                console.log('   ✅ Deleted merchant profile');
            }

            await prisma.user.delete({
                where: { id: existingUser.id }
            });
            console.log('   ✅ Deleted user');
            console.log('');
        } else {
            console.log('ℹ️  No existing user found');
            console.log('');
        }

        // 3. Check for duplicate RC numbers
        console.log('🔍 Checking for duplicate RC numbers...');
        const merchantByRc = await prisma.merchantProfile.findUnique({
            where: { rcNumber: tempRcNumber },
            include: { user: true }
        });

        if (merchantByRc) {
            console.log('⚠️  Found merchant with temp RC number:');
            console.log('   Profile ID:', merchantByRc.id);
            console.log('   User Email:', merchantByRc.user.email);
            console.log('   RC Number:', merchantByRc.rcNumber);

            console.log('🗑️  Deleting duplicate merchant...');
            await prisma.merchantProfile.delete({
                where: { id: merchantByRc.id }
            });
            await prisma.user.delete({
                where: { id: merchantByRc.userId }
            });
            console.log('   ✅ Deleted duplicate');
            console.log('');
        } else {
            console.log('ℹ️  No duplicate RC number found');
            console.log('');
        }

        console.log('✅ Database cleanup complete!');
        console.log('');
        console.log('📧 Next steps:');
        console.log('1. Click the activation link in the email');
        console.log('2. Enter password: GlobalTechNIGlb01$');
        console.log('3. Click "Activate My Account"');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectAndCleanup();
