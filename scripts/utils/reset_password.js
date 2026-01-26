const { PrismaClient } = require('./packages/database');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function reset() {
    try {
        console.log('Resetting password for superadmin@vistalock.com...');
        const hash = await bcrypt.hash('AdminPass123!', 10);
        const user = await prisma.user.upsert({
            where: { email: 'superadmin@vistalock.com' },
            update: { password: hash, role: 'SUPER_ADMIN' },
            create: { email: 'superadmin@vistalock.com', password: hash, role: 'SUPER_ADMIN' }
        });
        console.log('Reset Success! Role:', user.role);
    } catch (e) {
        console.error('Reset Failed', e);
    } finally {
        await prisma.$disconnect();
    }
}
reset();
