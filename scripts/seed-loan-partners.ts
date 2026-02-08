import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function seedLoanPartners() {
    try {
        console.log('🌱 Seeding loan partners to production database...\n');

        // Create 2 dummy loan partners
        const partner1 = await prisma.loanPartner.create({
            data: {
                name: 'VistaLock Capital',
                slug: 'vistalock-capital',
                apiKey: 'vl_capital_' + Math.random().toString(36).substring(2, 15),
                webhookSecret: 'secret_' + Math.random().toString(36).substring(2, 15),
                isActive: true,
            }
        });

        console.log('✅ Created Partner 1:');
        console.log('   Name:', partner1.name);
        console.log('   ID:', partner1.id);
        console.log('   API Key:', partner1.apiKey);
        console.log('');

        const partner2 = await prisma.loanPartner.create({
            data: {
                name: 'QuickCredit Partners',
                slug: 'quickcredit-partners',
                apiKey: 'qc_partners_' + Math.random().toString(36).substring(2, 15),
                webhookSecret: 'secret_' + Math.random().toString(36).substring(2, 15),
                isActive: true,
            }
        });

        console.log('✅ Created Partner 2:');
        console.log('   Name:', partner2.name);
        console.log('   ID:', partner2.id);
        console.log('   API Key:', partner2.apiKey);
        console.log('');

        console.log('🎉 SUCCESS! 2 loan partners created.');
        console.log('\n📋 Summary:');
        console.log('   - VistaLock Capital');
        console.log('   - QuickCredit Partners');
        console.log('\nThese will now appear in the Financing Partner dropdown!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedLoanPartners();
