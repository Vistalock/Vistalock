import { PrismaClient } from '@vistalock/database';

const prisma = new PrismaClient();

async function deleteMerchantApplication() {
    try {
        // Find Andy Technologies application
        const applications = await prisma.merchantApplication.findMany({
            where: {
                businessName: {
                    contains: 'Andy',
                    mode: 'insensitive'
                }
            }
        });

        console.log(`Found ${applications.length} application(s) matching "Andy":`);
        applications.forEach(app => {
            console.log(`- ID: ${app.id}, Business: ${app.businessName}, Status: ${app.status}`);
        });

        if (applications.length === 0) {
            console.log('No applications found to delete.');
            return;
        }

        // Delete all matching applications
        for (const app of applications) {
            await prisma.merchantApplication.delete({
                where: { id: app.id }
            });
            console.log(`✅ Deleted: ${app.businessName} (${app.id})`);
        }

        console.log('\n✅ All matching applications deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteMerchantApplication();
