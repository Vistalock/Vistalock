// Script to check partner credentials in production DB
// Run with: DATABASE_URL="your-connection-string" node scripts/check-partner-creds.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Querying LoanPartner credentials...\n');

    const partners = await prisma.loanPartner.findMany({
        select: {
            id: true,
            name: true,
            apiKey: true,
            apiSecret: true,
            isActive: true,
            contactEmail: true,
        }
    });

    if (partners.length === 0) {
        console.log('No loan partners found in the database!');
    } else {
        partners.forEach(p => {
            console.log(`Partner: ${p.name}`);
            console.log(`  ID:        ${p.id}`);
            console.log(`  API Key:   ${p.apiKey || 'NULL'}`);
            console.log(`  API Secret:${p.apiSecret ? '*** (set, length=' + p.apiSecret.length + ')' : 'NULL'}`);
            console.log(`  Active:    ${p.isActive}`);
            console.log(`  Email:     ${p.contactEmail || 'NULL'}`);
            console.log('');
        });
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
