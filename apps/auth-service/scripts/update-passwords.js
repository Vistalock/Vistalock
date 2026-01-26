// Update merchant passwords to a known value
// This script runs from auth-service directory where bcrypt is available

const { PrismaClient } = require('@vistalock/database');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePasswords() {
    console.log('🔧 Updating merchant passwords...\n');

    const password = 'Test123!@#$%';  // 12+ characters
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update Merchant A
    try {
        await prisma.user.update({
            where: { email: 'merchant-a@test.com' },
            data: { password: hash }
        });
        console.log('✅ Merchant A password updated');
    } catch (e) {
        console.log('❌ Error updating Merchant A:', e.message);
    }

    // Update Merchant B
    try {
        await prisma.user.update({
            where: { email: 'merchant-b@test.com' },
            data: { password: hash }
        });
        console.log('✅ Merchant B password updated');
    } catch (e) {
        console.log('❌ Error updating Merchant B:', e.message);
    }

    console.log('\n📋 Updated Credentials:');
    console.log('   Email: merchant-a@test.com / merchant-b@test.com');
    console.log('   Password: Test123!@#$%');
    console.log('\n✅ Done!\n');

    await prisma.$disconnect();
}

updatePasswords().catch(console.error);
