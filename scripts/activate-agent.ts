import { PrismaClient } from '@vistalock/database';

const prisma = new PrismaClient();

async function activateAgent() {
    const agentEmail = 'andrewoigure@gmail.com';

    try {
        // Find agent
        const agent = await prisma.user.findUnique({
            where: { email: agentEmail },
            include: { agentProfile: true }
        });

        if (!agent || !agent.agentProfile) {
            console.error('❌ Agent not found');
            return;
        }

        // Activate agent
        await prisma.agentProfile.update({
            where: { id: agent.agentProfile.id },
            data: {
                isActivated: true,
                deviceId: null  // Clear any old device binding
            }
        });

        console.log('✅ Agent activated successfully!');
        console.log(`\nAgent: ${agentEmail}`);
        console.log('Status: ACTIVATED');
        console.log('\n📱 Next steps:');
        console.log('1. Open mobile app');
        console.log('2. Log in with your credentials');
        console.log('3. Device will auto-bind on first login');
        console.log('4. Future logins must be from this device');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

activateAgent();
