import { PrismaClient, Role, BusinessType, MerchantStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function forceCreateMerchant() {
    try {
        console.log('🔍 Connecting to production database...\n');

        const email = 'andrewoigure@gmail.com';
        const password = 'GlobalTechNIGlb01$';

        // 1. Find the application
        const application = await prisma.merchantApplication.findFirst({
            where: { email }
        });

        if (!application) {
            console.log('❌ Application not found');
            return;
        }

        console.log('✅ Found application:', application.businessName);
        const tempRcNumber = `TEMP-${application.id.substring(0, 8)}`;

        // 2. Delete ALL existing merchants with this email or RC number
        console.log('\n🗑️  Cleaning up existing accounts...');

        // Find all possible duplicates
        const existingByEmail = await prisma.user.findUnique({
            where: { email },
            include: { merchantProfile: true }
        });

        const existingByRc = await prisma.merchantProfile.findUnique({
            where: { rcNumber: tempRcNumber },
            include: { user: true }
        });

        // Delete by email
        if (existingByEmail) {
            console.log('   Deleting user by email:', existingByEmail.email);
            if (existingByEmail.merchantProfile) {
                await prisma.merchantProfile.delete({
                    where: { id: existingByEmail.merchantProfile.id }
                });
            }
            await prisma.user.delete({
                where: { id: existingByEmail.id }
            });
            console.log('   ✅ Deleted');
        }

        // Delete by RC number (if different user)
        if (existingByRc && existingByRc.user.email !== email) {
            console.log('   Deleting merchant by RC:', existingByRc.rcNumber);
            await prisma.merchantProfile.delete({
                where: { id: existingByRc.id }
            });
            await prisma.user.delete({
                where: { id: existingByRc.userId }
            });
            console.log('   ✅ Deleted');
        }

        // 3. Create fresh merchant account
        console.log('\n✨ Creating new merchant account...');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: Role.MERCHANT,
                merchantProfile: {
                    create: {
                        businessName: application.businessName,
                        businessType: application.businessType as BusinessType || BusinessType.SOLE_PROPRIETORSHIP,
                        rcNumber: tempRcNumber,
                        businessAddress: application.businessAddress,
                        operatingAddress: application.operatingAddress || application.businessAddress,
                        directorName: application.contactName,
                        directorPhone: application.phone,
                        status: MerchantStatus.APPROVED,
                        agreementsSigned: true,
                        bankName: (application.bankDetails as any)?.bankName,
                        accountNumber: (application.bankDetails as any)?.accountNumber,
                        accountName: (application.bankDetails as any)?.accountName,
                    }
                }
            },
            include: { merchantProfile: true }
        });

        console.log('\n✅ SUCCESS! Merchant account created:');
        console.log('   User ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Business:', user.merchantProfile?.businessName);
        console.log('   RC Number:', user.merchantProfile?.rcNumber);
        console.log('   Status:', user.merchantProfile?.status);
        console.log('\n📧 Login Credentials:');
        console.log('   Email: andrewoigure@gmail.com');
        console.log('   Password: GlobalTechNIGlb01$');
        console.log('\n🔗 Login at: https://vistalock-merchant-portal.vercel.app/login');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

forceCreateMerchant();
