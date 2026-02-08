import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function checkLoanPartners() {
    try {
        console.log('🔍 Checking loan partners in production database...\n');

        const loanPartners = await prisma.loanPartner.findMany({
            include: {
                _count: {
                    select: { loans: true, users: true }
                }
            }
        });

        console.log(`Found ${loanPartners.length} loan partner(s):\n`);

        if (loanPartners.length === 0) {
            console.log('❌ No loan partners found in database!');
            console.log('\nThis is why the dropdown is empty.');
        } else {
            loanPartners.forEach((partner, index) => {
                console.log(`${index + 1}. ${partner.name}`);
                console.log(`   ID: ${partner.id}`);
                console.log(`   API Key: ${partner.apiKey || 'N/A'}`);
                console.log(`   Active: ${partner.isActive}`);
                console.log(`   Loans: ${partner._count.loans}`);
                console.log(`   Users: ${partner._count.users}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkLoanPartners();
