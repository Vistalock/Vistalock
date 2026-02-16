
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from packages/database
const envPath = path.resolve(__dirname, 'packages/database/.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB Connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    try {
        await prisma.$connect();
        console.log('✅ Connected to DB');
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
        console.error('Full Error:', JSON.stringify(e, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
