import { PrismaClient } from '@vistalock/database';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function setAgentPassword() {
    const agentEmail = 'andrewoigure@gmail.com';
    const password = 'Agent123!'; // You can change this

    try {
        // Find the agent
        const agent = await prisma.user.findUnique({
            where: { email: agentEmail }
        });

        if (!agent) {
            console.error('❌ Agent not found');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the agent with password
        await prisma.user.update({
            where: { email: agentEmail },
            data: {
                password: hashedPassword,
                emailVerified: new Date() // Mark as verified
            }
        });

        console.log('✅ Password set successfully!');
        console.log('\n📱 Login Credentials:');
        console.log(`Email: ${agentEmail}`);
        console.log(`Password: ${password}`);
        console.log('\nYou can now log in to the mobile app!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setAgentPassword();
