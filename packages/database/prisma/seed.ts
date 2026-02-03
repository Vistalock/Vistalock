import { PrismaClient, Role, DeviceStatus, LoanStatus, PaymentStatus, BusinessType, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');
    console.log('DB URL:', process.env.DATABASE_URL); // Debug logging

    // passwords
    const passwordHash = await bcrypt.hash('MerchantPass123!', 10);
    const adminHash = await bcrypt.hash('AdminPass123!', 10);

    // 1. Create Super Admin (Root)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@vistalock.com' },
        update: {
            password: adminHash,
        },
        create: {
            email: 'superadmin@vistalock.com',
            password: adminHash,
            role: Role.SUPER_ADMIN,
        },
    });
    console.log(`Created Super Admin: ${superAdmin.email}`);

    // 1b. Create Legacy Admin (Optional, for backward compat testing)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@vistalock.com' },
        update: {
            password: adminHash, // Force update password on seed run
        },
        create: {
            email: 'admin@vistalock.com',
            password: adminHash,
            role: Role.ADMIN,
        },
    });
    console.log(`Created/Updated Legacy Admin: ${admin.email}`);

    // 2. Create Merchant (skip if exists)
    let merchant;
    try {
        merchant = await prisma.user.upsert({
            where: { email: 'merchant@test.com' },
            update: {},
            create: {
                email: 'merchant@test.com',
                password: passwordHash,
                role: Role.MERCHANT,
                merchantProfile: {
                    create: {
                        businessName: "Test Merchant Ltd",
                        businessType: BusinessType.LIMITED_LIABILITY,
                        rcNumber: "RC123456",
                        businessAddress: "123 Market St",
                        directorName: "John Doe",
                        directorPhone: "08012345678",
                    }
                }
            },
        });
        console.log(`Created Merchant: ${merchant.email}`);
    } catch (e) {
        console.log('Merchant already exists, fetching...');
        merchant = await prisma.user.findUnique({ where: { email: 'merchant@test.com' } });
    }

    // 3. Create Customer (skip if exists)
    let customer;
    try {
        customer = await prisma.user.upsert({
            where: { email: 'customer@test.com' },
            update: {},
            create: {
                email: 'customer@test.com',
                password: passwordHash,
                role: Role.CUSTOMER,
                customerProfile: {
                    create: {
                        phoneNumber: "08099998888",
                        nin: "12345678901",
                        firstName: "Customer",
                        lastName: "One"
                    }
                }
            },
        });
        console.log(`Created Customer: ${customer.email}`);
    } catch (e) {
        console.log('Customer already exists, fetching...');
        customer = await prisma.user.findUnique({ where: { email: 'customer@test.com' } });
    }

    // Skip product/device/loan seeding if merchant or customer don't exist
    if (!merchant || !customer) {
        console.log('Skipping product/device/loan seeding due to missing merchant or customer');
        console.log('✅ Seeding complete (admin accounts updated).');
        return;
    }

    // 3b. Create Product (Required for Loans)
    const product = await prisma.product.create({
        data: {
            name: "Samsung Galaxy A14",
            price: 150000,
            merchantId: merchant.id,
            stockQuantity: 100,
            minDownPayment: 20000,
        }
    });

    // 4. Create Devices (50 units)
    console.log('Creating 50 Devices...');
    const devicePromises = [];
    for (let i = 0; i < 50; i++) {
        const imei = `35892109000${i.toString().padStart(4, '0')}`;
        devicePromises.push(
            prisma.device.upsert({
                where: { imei },
                update: {},
                create: {
                    imei,
                    serialNumber: `SN${i.toString().padStart(6, '0')}`,
                    model: i % 2 === 0 ? 'Samsung Galaxy A14' : 'Redmi Note 12',
                    status: i < 30 ? DeviceStatus.LOCKED : DeviceStatus.UNLOCKED, // Mix locked/unlocked
                    merchantId: merchant.id,
                },
            })
        );
    }
    await Promise.all(devicePromises);
    const allDevices = await prisma.device.findMany({ where: { merchantId: merchant.id } });
    console.log(`Seeded ${allDevices.length} devices.`);

    // 5. Create Loans (for first 20 devices)
    console.log('Creating Loans...');
    const loanPromises = [];
    for (let i = 0; i < 20; i++) {
        const device = allDevices[i];
        loanPromises.push(
            prisma.loan.create({
                data: {
                    loanAmount: 150000,
                    downPayment: 0,
                    monthlyRepayment: 26250,
                    interestRate: 5,
                    tenure: 6,
                    totalRepayment: 157500,
                    outstandingAmount: 157500,
                    userId: customer.id,
                    merchantId: merchant.id,
                    deviceIMEI: device.imei,
                    productId: product.id,
                    customerNIN: "12345678901",
                    customerPhone: "08099998888",
                    status: LoanStatus.ACTIVE,
                    payments: {
                        create: Array.from({ length: 6 }).map((_, idx) => ({
                            dueDate: new Date(new Date().setMonth(new Date().getMonth() + idx + 1)),
                            amount: 26250,
                            status: idx === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
                        })),
                    },
                },
            })
        );
    }
    // catch errors if loans typically don't upsert easily (id collision unlikely with uuid)
    try {
        await Promise.all(loanPromises);
        console.log('Seeded 20 active loans.');
    } catch (e) {
        console.log('Loans might already exist or error:', e);
    }

    // 6. Create Merchant Applications (for testing approval flow)
    console.log('Creating Merchant Applications...');
    const appPromises = [
        prisma.merchantApplication.upsert({
            where: { email: 'pending@ventures.com' },
            update: {},
            create: {
                businessName: 'Pending Ventures Ltd',
                email: 'pending@ventures.com',
                phone: '08012345678',
                contactName: 'John Doe',
                businessAddress: '123 Lagos Way',
                operations: { monthlyVolume: '500-1000' },
                status: 'PENDING'
            }
        }),
        prisma.merchantApplication.upsert({
            where: { email: 'ops@stores.com' },
            update: {},
            create: {
                businessName: 'Ops Reviewed Stores',
                email: 'ops@stores.com',
                phone: '08087654321',
                contactName: 'Jane Smith',
                businessAddress: '456 Abuja Crescent',
                operations: { monthlyVolume: '100-500' },
                status: 'OPS_REVIEWED'
            }
        }),
        prisma.merchantApplication.upsert({
            where: { email: 'risk@ent.com' },
            update: {},
            create: {
                businessName: 'Risk Reviewed Enterprises',
                email: 'risk@ent.com',
                phone: '08099887766',
                contactName: 'Bob Risk',
                businessAddress: '789 Kano Street',
                operations: { monthlyVolume: '1000+' },
                status: 'RISK_REVIEWED'
            }
        })
    ];

    await Promise.all(appPromises);
    console.log('Seeded 3 Merchant Applications.');

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
