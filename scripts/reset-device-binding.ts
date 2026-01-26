import { PrismaClient } from '@vistalock/database';

const prisma = new PrismaClient();

async function resetDeviceBinding() {
    const agentEmail = 'andrewoigure@gmail.com';

    try {
        // Find the agent user
        const agent = await prisma.user.findUnique({
            where: { email: agentEmail },
            include: { agentProfile: true }
        });

        if (!agent || !agent.agentProfile) {
            console.error('❌ Agent not found or no agent profile');
            return;
        }

        // Clear the device binding in AgentProfile
        await prisma.agentProfile.update({
            where: { id: agent.agentProfile.id },
            data: {
                deviceId: null  // Clear device binding
            }
        });

        console.log('✅ Device binding reset successfully!');
        console.log(`Agent: ${agentEmail}`);
        console.log('You can now log in from any device.');
        console.log('\nTry logging in again on the mobile app.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDeviceBinding();
