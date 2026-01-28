import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually since dotenv might not be present
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    console.log(`Loading .env from ${envPath}`);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.warn('.env file not found at project root');
}

const prisma = new PrismaClient();

async function reset() {
    try {
        console.log('Resetting password for admin@vistalock.com...');
        const hash = await bcrypt.hash('AdminPass123!', 10);

        // Try to find the user first to confirm existence
        const existing = await prisma.user.findUnique({
            where: { email: 'admin@vistalock.com' }
        });

        if (!existing) {
            console.log('User admin@vistalock.com not found. Creating...');
            await prisma.user.create({
                data: {
                    email: 'admin@vistalock.com',
                    password: hash,
                    role: 'ADMIN' // or SUPER_ADMIN depending on needs, but seed used ADMIN for this email
                }
            });
            console.log('Created admin@vistalock.com');
        } else {
            await prisma.user.update({
                where: { email: 'admin@vistalock.com' },
                data: { password: hash }
            });
            console.log('Updated password for admin@vistalock.com');
        }

    } catch (e) {
        console.error('Reset Failed', e);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
