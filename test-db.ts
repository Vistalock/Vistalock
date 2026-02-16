
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, 'packages/database/.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB Connection...');
    try {
        await prisma.$connect();
        console.log('✅ Connected to DB');
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
