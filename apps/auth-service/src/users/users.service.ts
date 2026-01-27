import { Injectable, OnModuleInit } from '@nestjs/common';
// @ts-ignore
import { prisma as isPrisma, User, Role, PrismaClient } from '@vistalock/database';

@Injectable()
export class UsersService implements OnModuleInit {
    private prisma: PrismaClient;

    constructor() {
        console.log('🔍 DEBUG: DATABASE_URL from env:', process.env.DATABASE_URL);
        // Fallback or explicit usage
        this.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            },
            log: ['query', 'info', 'warn', 'error']
        });
    }

    async onModuleInit() {
        try {
            // Test database connection on module initialization
            await this.prisma.$connect();
            console.log('✅ UsersService LOCAL: Database connected successfully');

            // Test query to verify connection
            const userCount = await this.prisma.user.count();
            console.log(`✅ UsersService LOCAL: Found ${userCount} users in database`);
        } catch (error) {
            console.error('❌ UsersService LOCAL: Database connection failed:', error);
        }
    }
    async deleteUser(id: string): Promise<void> {
        // We might need to delete related profiles first if cascading isn't automatic, 
        // but Prisma schema usually handles it or we do it manually.
        // For now, simple delete.
        await this.prisma.user.delete({ where: { id } });
    }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: any): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                role: data.role as Role,
            },
        });
    }

    async findByApiKey(apiKey: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { apiKey },
        });
    }

    async update(id: string, data: any): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async createAgent(merchantId: string, data: any): Promise<User> {
        try {
            console.log('Attempting to create agent with data:', JSON.stringify(data));
            return await this.prisma.user.create({
                data: {
                    email: data.email,
                    password: data.password || null, // Allow null for invitation flow
                    role: Role.MERCHANT_AGENT,
                    merchantId: merchantId,
                    agentProfile: {
                        create: {
                            fullName: data.fullName,
                            phoneNumber: data.phoneNumber,
                            branch: data.branch,
                            onboardingLimit: Number(data.onboardingLimit) || 0,
                            status: 'PENDING'
                        }
                    }
                },
                include: {
                    agentProfile: true
                }
            });
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    }

    async getAgents(merchantId: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { merchantId },
            include: {
                agentProfile: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async upsertMerchantProfile(userId: string, data: any) {
        return this.prisma.merchantProfile.upsert({
            where: { userId },
            update: { ...data },
            create: {
                userId,
                ...data
            },
        });
    }

    async getMerchantProfile(userId: string) {
        return this.prisma.merchantProfile.findUnique({
            where: { userId },
        });
    }

    async findAllInternal(): Promise<Partial<User>[]> {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: [
                        Role.SUPER_ADMIN,
                        Role.ADMIN,
                        Role.SUPPORT_ADMIN,
                        Role.COMPLIANCE_ADMIN,
                        Role.RISK_ADMIN,
                        Role.OPS_ADMIN,
                        Role.TECH_ADMIN
                    ],
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            }
        });
    }
    async updateAgentProfile(userId: string, data: any) {
        // userId here is actually the User ID, let's ensure we find the profile connected to it
        // Or if the input is User Object, we navigate to profile.
        // Assuming input is User ID.
        return this.prisma.agentProfile.update({
            where: { userId },
            data,
        });
    }

    async findAgentByToken(token: string) {
        return this.prisma.agentProfile.findUnique({
            where: { activationToken: token },
        });
    }

    async updateAgentProfileByUserId(userId: string, data: any) {
        return this.prisma.agentProfile.update({
            where: { userId },
            data,
        });
    }

    async getAgentProfileByUserId(userId: string) {
        return this.prisma.agentProfile.findUnique({
            where: { userId }
        });
    }
    async getAgentStats(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const agent = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { agentProfile: true }
        });

        if (!agent || !agent.agentProfile) return null;

        // Count customers created today by this agent (using metadata or implicit flow if we had it)
        // For now, returning counters based on onboarding limit
        return {
            today: 0,
            limit: agent.agentProfile.onboardingLimit,
            pending: 0
        };
    }

    async onboardCustomer(agentId: string, merchantId: string, customerData: any, deviceData: any, loanData: any, files: { idCardUrl?: string, selfieUrl?: string }) {
        // 1. Create/Upsert User (Customer)
        // Use fake email if not provided
        const email = customerData.email || `${customerData.phoneNumber}@vistalock.fake`;

        return this.prisma.$transaction(async (tx: any) => {
            // A. Customer User
            const user = await tx.user.upsert({
                where: { email },
                update: {},
                create: {
                    email,
                    role: Role.CUSTOMER,
                    password: null, // No password yet, OTP login
                    merchantId: merchantId, // Link to Merchant
                }
            });

            // B. Customer Profile
            // Clean phone number (remove spaces etc)
            const cleanPhone = customerData.phoneNumber.replace(/\s+/g, '');

            await tx.customerProfile.upsert({
                where: { userId: user.id },
                update: {
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    address: customerData.address,
                    photoUrl: files.selfieUrl,
                },
                create: {
                    userId: user.id,
                    phoneNumber: cleanPhone,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    address: customerData.address,
                    photoUrl: files.selfieUrl,
                }
            });

            // C. Device Provisioning
            let device = await tx.device.findUnique({ where: { imei: deviceData.imei } });
            if (!device) {
                device = await tx.device.create({
                    data: {
                        imei: deviceData.imei,
                        model: deviceData.model,
                        merchantId: merchantId,
                        status: 'PENDING_SETUP'
                    }
                });
            } else {
                if (device.merchantId !== merchantId) {
                    throw new Error(`Device ${deviceData.imei} is registered to another merchant.`);
                }
            }

            // D. Loan Creation
            const product = await tx.product.findUnique({ where: { id: loanData.productId } });
            if (!product) throw new Error('Product not found');
            if (product.merchantId !== merchantId) throw new Error('Product does not belong to this merchant');

            const price = Number(product.price);
            const downPayment = Number(loanData.downPayment);
            const tenureMonths = Number(loanData.tenure);

            // Validation
            if (downPayment < Number(product.minDownPayment)) throw new Error(`Minimum down payment is ${product.minDownPayment}`);
            if (tenureMonths < product.minTenure || tenureMonths > product.maxTenure) throw new Error(`Invalid tenure`);

            // Calculation
            const principal = price - downPayment;
            const monthlyRate = Number(product.interestRate) / 100;
            const totalInterest = principal * monthlyRate * tenureMonths;
            const totalRepayment = principal + totalInterest;
            const monthlyAmount = totalRepayment / tenureMonths;

            // Create Loan
            const loan = await tx.loan.create({
                data: {
                    amount: totalRepayment, // Storing total repayment as amount or principal? Usually Principal. 
                    // Schema says 'amount' - ambiguous. Let's assume Principal or Total? 
                    // BNPL usually tracks "Total Debt". Let's store TotalRepayment.
                    currency: product.currency,
                    interestRate: product.interestRate,
                    durationMonths: tenureMonths,
                    userId: user.id,
                    deviceId: device.id,
                    merchantId: merchantId,
                    status: 'PENDING', // Waiting for down payment confirmation
                }
            });

            // Generate Installments
            const installments: any[] = [];
            let currentDate = new Date(); // Start date (usually today or upon activation)

            for (let i = 1; i <= tenureMonths; i++) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                installments.push({
                    loanId: loan.id,
                    installment: i, // We might need to add 'installmentNumber' to schema or relying on order/metadata? Schema didn't show it.
                    // Schema has 'dueDate', 'amountDue', 'amountPaid', 'status'.
                    dueDate: new Date(currentDate),
                    amountDue: monthlyAmount,
                    status: 'PENDING'
                });
            }

            // Batch insert installments? Installment model doesn't have createMany in standard SQLite/some DBs easily, but Postgres does.
            // Using createMany
            // Wait, Installment model in schema snippet viewed earlier:
            /*
            model Installment {
              id String @id @default(uuid())
              loanId String
              ...
            }
            */
            // createMany is supported. But wait, `installments` array has objects matching the CreateInput minus `id`?
            // Yes.
            // Note: InstallmentStatus enum needs to be imported or string literal used if it matches. 'PENDING' matches.

            // To be safe with `createMany` and Relations (Postgres supports it):
            await tx.installment.createMany({
                data: installments.map(i => ({
                    loanId: i.loanId,
                    dueDate: i.dueDate,
                    amountDue: i.amountDue,
                    status: 'PENDING'
                }))
            });

            return {
                customerId: user.id,
                deviceId: device.id,
                loanId: loan.id,
                status: 'SUCCESS'
            };
        });
    }
}
