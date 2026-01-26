// Check for existing agents in database
const { PrismaClient } = require('@vistalock/database');

const prisma = new PrismaClient();

async function checkAgents() {
    console.log('🔍 Checking for existing agents...\n');

    const agents = await prisma.user.findMany({
        where: {
            role: 'MERCHANT_AGENT'
        },
        select: {
            id: true,
            email: true,
            merchantId: true,
            createdAt: true,
            agentProfile: true
        }
    });

    console.log(`Found ${agents.length} existing agents:\n`);

    if (agents.length > 0) {
        agents.forEach((agent, index) => {
            console.log(`${index + 1}. Email: ${agent.email || 'N/A'}`);
            console.log(`   ID: ${agent.id}`);
            console.log(`   Merchant ID: ${agent.merchantId || 'N/A'}`);
            console.log(`   Has Profile: ${agent.agentProfile ? 'Yes' : 'No'}`);
            console.log(`   Created: ${agent.createdAt}`);
            console.log('---');
        });

        console.log('\n⚠️  Migration needed: These agents will need activation tokens.');
    } else {
        console.log('✅ No existing agents found. Clean slate!');
    }

    await prisma.$disconnect();
}

checkAgents().catch(console.error);
