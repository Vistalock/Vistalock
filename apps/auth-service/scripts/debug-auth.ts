
import { PrismaClient } from '@vistalock/database';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://user:secret123@127.0.0.1:5433/vistalock_local'
        }
    }
});

async function main() {
    try {
        console.log('Connecting...');
        const count = await prisma.user.count();
        console.log('Connection Successful! User count:', count);
    } catch (e) {
        console.error('Connection Failed:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
