import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db'
        }
    }
});

async function analyzeDuplicates() {
    console.log('🔍 Analyzing duplicate merchant applications...\n');

    // Get all applications
    const applications = await prisma.merchantApplication.findMany({
        orderBy: [
            { businessName: 'asc' },
            { createdAt: 'asc' }
        ],
        select: {
            id: true,
            businessName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
        }
    });

    console.log(`📊 Total applications: ${applications.length}\n`);

    // Group by business name + email to find duplicates
    const groups = new Map<string, typeof applications>();

    for (const app of applications) {
        const key = `${app.businessName.toLowerCase()}|${app.email.toLowerCase()}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(app);
    }

    // Find duplicates
    const duplicates = Array.from(groups.entries())
        .filter(([_, apps]) => apps.length > 1)
        .map(([key, apps]) => ({ key, apps }));

    console.log(`🔴 Duplicate groups found: ${duplicates.length}\n`);

    if (duplicates.length === 0) {
        console.log('✅ No duplicates found!');
        await prisma.$disconnect();
        return;
    }

    // Display duplicates
    for (const { key, apps } of duplicates) {
        const [businessName] = key.split('|');
        console.log(`\n📌 ${businessName} (${apps.length} copies):`);
        apps.forEach((app, idx) => {
            console.log(`   ${idx + 1}. ID: ${app.id.substring(0, 8)}... | Status: ${app.status} | Created: ${app.createdAt.toISOString()}`);
        });
    }

    // Summary
    const totalDuplicates = duplicates.reduce((sum, { apps }) => sum + apps.length - 1, 0);
    console.log(`\n📊 Summary:`);
    console.log(`   - Unique businesses with duplicates: ${duplicates.length}`);
    console.log(`   - Total duplicate records to clean: ${totalDuplicates}`);
    console.log(`   - Total records after cleanup: ${applications.length - totalDuplicates}`);

    await prisma.$disconnect();
}

analyzeDuplicates().catch(console.error);
