import { PrismaClient } from '@prisma/client';

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
        const partners = await prisma.loanPartner.findMany({
            include: {
                _count: {
                    select: { Loan: true }
                }
            }
        });
        console.log(`Found ${partners.length} Loan Partners:`);
        partners.forEach(p => {
            console.log(`- Partner: ${p.name} (ID: ${p.id})`);
            console.log(`  Linked to Merchant ID: ${p.merchantId}`);
            console.log(`  Total Loans: ${p._count.Loan}`);
            console.log(`  API Key: ${p.apiKey ? 'Set' : 'Null'}`);
        });

        const totalLoans = await prisma.loan.count();
        console.log(`Total System Loans: ${totalLoans}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
