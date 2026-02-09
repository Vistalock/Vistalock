import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPricingTiers() {
    console.log('🌱 Seeding pricing tiers...');

    const tiers = [
        {
            name: 'Starter',
            minVolume: 0,
            maxVolume: 10,
            pricePerDevice: 1500.0,
            currency: 'NGN',
            isActive: true,
        },
        {
            name: 'Growth',
            minVolume: 11,
            maxVolume: 50,
            pricePerDevice: 1000.0,
            currency: 'NGN',
            isActive: true,
        },
        {
            name: 'Professional',
            minVolume: 51,
            maxVolume: 200,
            pricePerDevice: 750.0,
            currency: 'NGN',
            isActive: true,
        },
        {
            name: 'Enterprise',
            minVolume: 201,
            maxVolume: null, // Unlimited
            pricePerDevice: 500.0,
            currency: 'NGN',
            isActive: true,
        },
    ];

    for (const tier of tiers) {
        await prisma.pricingTier.upsert({
            where: { name: tier.name },
            update: tier,
            create: tier,
        });
        console.log(`✅ Created/Updated pricing tier: ${tier.name} (₦${tier.pricePerDevice}/device)`);
    }

    console.log('✅ Pricing tiers seeded successfully!');
}

async function seedFeatures() {
    console.log('🌱 Seeding feature catalog...');

    const features = [
        {
            name: 'Advanced GPS Tracking',
            description: 'Real-time location tracking with 90-day history and geofencing alerts',
            category: 'SECURITY',
            pricingType: 'PER_DEVICE',
            price: 150.0,
            isActive: true,
            metadata: {
                features: ['Real-time location', '90-day history', 'Geofencing', 'Location alerts'],
            },
        },
        {
            name: 'Camera & Mic Activation',
            description: 'Remote photo capture and audio recording for fraud detection',
            category: 'SECURITY',
            pricingType: 'PER_DEVICE',
            price: 150.0,
            isActive: true,
            metadata: {
                features: ['Remote photo', 'Audio recording', 'Fraud detection'],
            },
        },
        {
            name: 'Enhanced Lock Security',
            description: 'Custom lock screen branding and multi-level lock policies',
            category: 'SECURITY',
            pricingType: 'PER_DEVICE',
            price: 100.0,
            isActive: true,
            metadata: {
                features: ['Custom lock screen', 'Multi-level policies', 'Extended offline grace'],
            },
        },
        {
            name: 'Advanced Analytics Dashboard',
            description: 'Predictive default alerts, agent performance scoring, and custom reports',
            category: 'ANALYTICS',
            pricingType: 'FLAT_MONTHLY',
            price: 5000.0,
            isActive: true,
            metadata: {
                features: ['Predictive alerts', 'Performance scoring', 'Custom reports', 'Data exports'],
            },
        },
        {
            name: 'Business Intelligence',
            description: 'Trend analysis, risk scoring, and automated insights',
            category: 'ANALYTICS',
            pricingType: 'FLAT_MONTHLY',
            price: 10000.0,
            isActive: true,
            metadata: {
                features: ['Trend analysis', 'Risk scoring', 'Automated insights'],
            },
        },
        {
            name: 'Custom API Access',
            description: 'Higher rate limits, webhook customization, and priority support',
            category: 'INTEGRATION',
            pricingType: 'FLAT_MONTHLY',
            price: 15000.0,
            isActive: true,
            metadata: {
                features: ['Higher rate limits', 'Webhook customization', 'Priority support'],
            },
        },
        {
            name: 'Priority Support',
            description: 'Dedicated support agent with 24/7 availability',
            category: 'SUPPORT',
            pricingType: 'FLAT_MONTHLY',
            price: 10000.0,
            isActive: true,
            metadata: {
                features: ['Dedicated agent', '24/7 availability', 'Faster response'],
            },
        },
        {
            name: 'White-Label Branding',
            description: 'Custom domain, remove VistaLock branding, custom email templates',
            category: 'SUPPORT',
            pricingType: 'FLAT_MONTHLY',
            price: 25000.0,
            isActive: true,
            metadata: {
                features: ['Custom domain', 'Remove branding', 'Custom emails'],
            },
        },
    ];

    for (const feature of features) {
        await prisma.feature.upsert({
            where: { name: feature.name },
            update: feature,
            create: feature,
        });
        console.log(`✅ Created/Updated feature: ${feature.name} (₦${feature.price}/${feature.pricingType})`);
    }

    console.log('✅ Feature catalog seeded successfully!');
}

async function createMerchantWallets() {
    console.log('🌱 Creating wallets for existing merchants...');

    const merchants = await prisma.user.findMany({
        where: {
            role: 'MERCHANT',
        },
        include: {
            wallet: true,
        },
    });

    let created = 0;
    let skipped = 0;

    for (const merchant of merchants) {
        if (!merchant.wallet) {
            await prisma.merchantWallet.create({
                data: {
                    merchantId: merchant.id,
                    balance: 0,
                    currency: 'NGN',
                    status: 'ACTIVE',
                },
            });
            console.log(`✅ Created wallet for merchant: ${merchant.email}`);
            created++;
        } else {
            console.log(`⏭️  Wallet already exists for: ${merchant.email}`);
            skipped++;
        }
    }

    console.log(`✅ Wallets created: ${created}, Skipped: ${skipped}`);
}

async function main() {
    try {
        await seedPricingTiers();
        await seedFeatures();
        await createMerchantWallets();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
