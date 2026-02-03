import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db'
        }
    }
});

async function cleanupDuplicateEmails() {
    console.log('🧹 Starting duplicate email cleanup...\n');

    // Get all applications
    const applications = await prisma.merchantApplication.findMany({
        orderBy: [
            { createdAt: 'asc' }
        ],
    });

    console.log(`📊 Total applications: ${applications.length}\n`);

    // Group by email to find duplicates
    const groups = new Map<string, typeof applications>();

    for (const app of applications) {
        const key = app.email.toLowerCase().trim();
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(app);
    }

    // Find duplicates and prepare for deletion
    const toDelete: string[] = [];
    const toKeep: string[] = [];

    for (const [key, apps] of groups.entries()) {
        if (apps.length > 1) {
            // Sort by status priority and creation date
            const statusPriority: Record<string, number> = {
                'APPROVED': 1,
                'RISK_REVIEWED': 2,
                'OPS_REVIEWED': 3,
                'PENDING': 4,
                'REJECTED': 5,
            };

            apps.sort((a, b) => {
                const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
                if (priorityDiff !== 0) return priorityDiff;
                // If same status, keep the oldest one
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

            // Keep the first one (highest priority/oldest), delete the rest
            const [keep, ...remove] = apps;
            toKeep.push(keep.id);
            toDelete.push(...remove.map(app => app.id));

            console.log(`\n📌 Email: ${key}`);
            console.log(`   ✅ KEEPING: ID ${keep.id.substring(0, 8)}... | Business: ${keep.businessName} | Status: ${keep.status} | Created: ${keep.createdAt.toISOString()}`);
            console.log(`   🗑️  DELETING ${remove.length} duplicates:`);
            remove.forEach((app, idx) => {
                console.log(`      ${idx + 1}. ID ${app.id.substring(0, 8)}... | Business: ${app.businessName} | Status: ${app.status} | Created: ${app.createdAt.toISOString()}`);
            });
        }
    }

    if (toDelete.length === 0) {
        console.log('\n✅ No email duplicates to clean!');
        await prisma.$disconnect();
        return;
    }

    console.log(`\n\n📊 Cleanup Summary:`);
    console.log(`   - Records to keep: ${toKeep.length}`);
    console.log(`   - Records to delete: ${toDelete.length}`);
    console.log(`   - Total after cleanup: ${applications.length - toDelete.length}`);

    console.log(`\n⚠️  Proceeding with deletion in 3 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Perform deletion
    console.log(`\n🗑️  Deleting ${toDelete.length} duplicate records...`);

    const result = await prisma.merchantApplication.deleteMany({
        where: {
            id: {
                in: toDelete
            }
        }
    });

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   - Deleted: ${result.count} records`);
    console.log(`   - Remaining: ${applications.length - result.count} records`);

    await prisma.$disconnect();
}

cleanupDuplicateEmails().catch(console.error);
