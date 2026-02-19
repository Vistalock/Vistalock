const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db"
        }
    }
});

async function main() {
    try {
        console.log("Connected to Prod DB...");

        // 1. Check Loan Partners (No relations)
        console.log("Fetching Loan Partners...");
        const partners = await prisma.loanPartner.findMany();

        console.log(`Found ${partners.length} Loan Partners:`);
        partners.forEach(p => {
            console.log(`- Partner: ${p.name} (ID: ${p.id})`);
            console.log(`  Merchant ID: ${p.merchantId}`);
        });

        // 2. Check Merchants
        console.log("Fetching Merchants...");
        const merchants = await prisma.merchantProfile.findMany({
            take: 5
        });
        console.log(`Sample Merchants: ${merchants.length}`);

        // 3. Check Loans (Sample)
        const loans = await prisma.loan.findMany({ take: 1 });
        console.log(`Loan sample:`, loans.length > 0 ? 'Exists' : 'None');

    } catch (e) {
        console.error("Error querying DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
