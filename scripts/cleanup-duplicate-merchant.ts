import { PrismaClient } from '@prisma/client';

// Use production database URL from environment
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function cleanupDuplicateMerchant() {
    try {
        console.log('🔍 Connecting to database...');
        console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

        // Find the merchant application
        const application = await prisma.merchantApplication.findFirst({
            where: {
                email: 'andrewoigure@gmail.com',
                businessName: 'Test Electronics Ltd'
            }
        });

        if (!application) {
            console.log('❌ Application not found');
            return;
        }

        console.log('✅ Found application:', application.id);
        const tempRcNumber = `TEMP-${application.id.substring(0, 8)}`;
        console.log('Expected RC Number:', tempRcNumber);

        // Find any existing user with this email
        const existingUser = await prisma.user.findUnique({
            where: { email: 'andrewoigure@gmail.com' },
            include: { merchantProfile: true }
        });

        if (existingUser) {
            console.log('🗑️  Found existing user:', existingUser.id);
            console.log('    Email:', existingUser.email);
            console.log('    Role:', existingUser.role);

            // Delete merchant profile first (if exists)
            if (existingUser.merchantProfile) {
                console.log('    Merchant Profile ID:', existingUser.merchantProfile.id);
                console.log('    RC Number:', existingUser.merchantProfile.rcNumber);

                await prisma.merchantProfile.delete({
                    where: { id: existingUser.merchantProfile.id }
                });
                console.log('✅ Deleted merchant profile');
            }

            // Delete user
            await prisma.user.delete({
                where: { id: existingUser.id }
            });
            console.log('✅ Deleted user');
        } else {
            console.log('ℹ️  No existing user found with this email');
        }

        // Also check for any merchant profile with the temp RC number
        const merchantByRc = await prisma.merchantProfile.findUnique({
            where: { rcNumber: tempRcNumber },
            include: { user: true }
        });

        if (merchantByRc) {
            console.log('🗑️  Found merchant profile with temp RC number');
            console.log('    User email:', merchantByRc.user.email);

            if (merchantByRc.user.email !== 'andrewoigure@gmail.com') {
                await prisma.merchantProfile.delete({
                    where: { id: merchantByRc.id }
                });
                await prisma.user.delete({
                    where: { id: merchantByRc.userId }
                });
                console.log('✅ Deleted duplicate merchant');
            }
        } else {
            console.log('ℹ️  No merchant profile found with temp RC number');
        }

        console.log('\n✅ Cleanup complete! You can now try activation again.');
        console.log('📧 Use email: andrewoigure@gmail.com');
        console.log('🔗 Click the activation link in the email');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicateMerchant();
