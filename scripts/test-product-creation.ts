// Script to test product creation with the exact data from frontend
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function testProductCreation() {
    try {
        console.log('🧪 Testing product creation...\n');

        // Find the merchant user
        const merchant = await prisma.user.findUnique({
            where: { email: 'andrewoigure@gmail.com' },
            include: { merchantProfile: true }
        });

        if (!merchant) {
            console.log('❌ Merchant not found');
            return;
        }

        console.log('✅ Found merchant:', merchant.id);
        console.log('   Email:', merchant.email);
        console.log('   Role:', merchant.role);
        console.log('');

        // Test data similar to what frontend sends
        const testProduct = {
            name: 'Samsung Galaxy S22',
            brand: 'Samsung',
            model: 'S22',
            osType: 'Android',
            retailPrice: 450000,
            bnplEligible: true,
            maxTenureMonths: 6,
            downPayment: 50000,
            lockSupport: true,
            status: 'active',
            stockQuantity: 10,
            loanPartnerId: null, // or a valid loan partner ID
            merchantId: merchant.id
        };

        console.log('📦 Test product data:', JSON.stringify(testProduct, null, 2));
        console.log('');

        // Try to create product
        const product = await prisma.product.create({
            data: testProduct as any
        });

        console.log('✅ Product created successfully!');
        console.log('   ID:', product.id);
        console.log('   Name:', product.name);

    } catch (error: any) {
        console.error('❌ Error creating product:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testProductCreation();
