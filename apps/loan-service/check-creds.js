const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db?sslmode=require'
        }
    }
});

async function main() {
    console.log('Querying LoanPartner credentials...\n');
    const partners = await prisma.loanPartner.findMany({
        select: {
            id: true,
            name: true,
            apiKey: true,
            apiSecret: true,
            isActive: true,
        }
    });

    if (partners.length === 0) {
        console.log('No loan partners found!');
    } else {
        partners.forEach(p => {
            console.log(`Name:     ${p.name}`);
            console.log(`API Key:  ${p.apiKey || 'NULL'}`);
            console.log(`API Secret: ${p.apiSecret ? `SET (length ${p.apiSecret.length})` : 'NULL'}`);
            console.log(`Active:   ${p.isActive}`);
            console.log('---');
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
