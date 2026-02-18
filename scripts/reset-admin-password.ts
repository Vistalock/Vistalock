
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'andrewoigure@gmail.com';
    const newPassword = 'GlobalTechNIGlb01$';

    console.log(`Resetting password for: ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ User not found!');
        return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    console.log('✅ Password reset successfully to:', newPassword);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
