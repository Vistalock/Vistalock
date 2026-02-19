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
        const partners = await prisma.loanPartner.findMany();
        console.log("--- PARTNERS ---");
        partners.forEach(p => console.log(`${p.name} : ${p.id}`));
        console.log("----------------");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
