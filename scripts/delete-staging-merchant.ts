import { PrismaClient } from '@vistalock/database';

// This script connects to the staging database and deletes merchant applications
// Usage: DATABASE_URL="your-staging-db-url" npx tsx scripts/delete-staging-merchant.ts

const prisma = new PrismaClient();

async function deleteStagingMerchantApplication() {
    try {
        console.log('🔍 Searching for merchant applications containing "Andy"...\n');

        // Find all applications matching "Andy"
        const applications = await prisma.merchantApplication.findMany({
            where: {
                businessName: {
                    contains: 'Andy',
                    mode: 'insensitive'
                }
            }
        });

        if (applications.length === 0) {
            console.log('❌ No applications found matching "Andy"');
            return;
        }

        console.log(`Found ${applications.length} application(s):\n`);
        applications.forEach((app, index) => {
            console.log(`${index + 1}. Business: ${app.businessName}`);
            console.log(`   Email: ${app.email}`);
            console.log(`   Status: ${app.status}`);
            console.log(`   ID: ${app.id}`);
            console.log('');
        });

        // Delete all matching applications
        console.log('🗑️  Deleting applications...\n');

        for (const app of applications) {
            await prisma.merchantApplication.delete({
                where: { id: app.id }
            });
            console.log(`✅ Deleted: ${app.businessName} (${app.email})`);
        }

        console.log('\n✅ All matching applications deleted successfully!');
        console.log('You can now test the new merchant registration flow from scratch.');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

deleteStagingMerchantApplication();
