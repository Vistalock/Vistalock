import { PrismaClient } from '@vistalock/database';

async function main() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

    console.log('Connecting to database...');

    // Find all agents
    const agents = await prisma.user.findMany({
        where: { role: 'MERCHANT_AGENT' },
        include: { agentProfile: true }
    });

    console.log(`Found ${agents.length} agents in the database:`);
    agents.forEach(agent => {
        console.log(`\nEmail: ${agent.email}`);
        console.log(`Password Set: ${!!agent.password}`);
        console.log(`Is Active: ${agent.isActive}`);
        if (agent.agentProfile) {
            console.log(`Profile Activated: ${agent.agentProfile.isActivated}`);
            console.log(`Phone: ${agent.agentProfile.phoneNumber}`);
            console.log(`Name: ${agent.agentProfile.fullName}`);
        }
    });

    await prisma.$disconnect();
}

main().catch(console.error);
