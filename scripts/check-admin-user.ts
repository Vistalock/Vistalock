
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'andrewoigure@gmail.com';
    console.log(`Checking for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { merchantProfile: true }
    });

    if (user) {
        console.log('✅ User Found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            merchantId: user.merchantProfile?.id,
            password: user.password ? 'Has Password (Hashed)' : 'NO PASSWORD SET',
        });
    } else {
        console.log('❌ User NOT Found in DB');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
