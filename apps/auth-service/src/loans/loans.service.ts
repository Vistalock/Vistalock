import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class LoansService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    async calculateLoan(productId: string, downPayment: number, tenureMonths: number, merchantId?: string) {
        // 1. Fetch Product
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        if (merchantId && product.merchantId !== merchantId) {
            throw new BadRequestException('Product not available for this merchant');
        }

        // 2. Validate Constraints
        if (tenureMonths < product.minTenure || tenureMonths > product.maxTenure) {
            throw new BadRequestException(`Tenure must be between ${product.minTenure} and ${product.maxTenure} months.`);
        }

        const minDown = Number(product.minDownPayment);
        const price = Number(product.price);

        if (downPayment < minDown) {
            throw new BadRequestException(`Minimum down payment is ${minDown}`);
        }
        if (downPayment >= price) {
            throw new BadRequestException(`Down payment cannot equal or exceed product price.`);
        }

        // 3. Calculation Logic (Simple Flat Rate for MVP)
        // Principal = Price - DownPayment
        // Interest = Principal * (MonthlyRate * Tenure)
        // TotalRepayment = Principal + Interest
        // MonthlyRepayment = TotalRepayment / Tenure

        const principal = price - downPayment;
        const monthlyRate = Number(product.interestRate) / 100; // e.g. 2.5% -> 0.025
        const totalInterest = principal * monthlyRate * tenureMonths;
        const totalRepayment = principal + totalInterest;
        const monthlyRepayment = totalRepayment / tenureMonths;

        return {
            productId,
            productName: product.name,
            price,
            downPayment,
            tenureMonths,
            principal,
            interestRate: Number(product.interestRate),
            totalInterest,
            totalRepayment,
            monthlyRepayment,
            currency: product.currency,
            breakdown: this.generateSchedule(totalRepayment, tenureMonths, new Date())
        };
    }

    private generateSchedule(totalAmount: number, months: number, startDate: Date) {
        const schedule: { installment: number; dueDate: Date; amount: number }[] = [];
        const monthlyAmount = totalAmount / months;
        let currentDate = new Date(startDate);

        for (let i = 1; i <= months; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            schedule.push({
                installment: i,
                dueDate: new Date(currentDate),
                amount: Math.round(monthlyAmount * 100) / 100 // Round to 2 decimals
            });
        }
        return schedule;
    }
    async createLoan(merchantId: string, data: any) {
        const { customerId, productId, deviceId, downPayment, tenureMonths } = data;

        return this.prisma.$transaction(async (tx: any) => {
            // 1. Verify Customer
            const customer = await tx.user.findUnique({ where: { id: customerId } });
            if (!customer) throw new NotFoundException('Customer not found');
            if (customer.merchantId !== merchantId) throw new ConflictException('Customer belongs to another merchant');

            // 2. Verify Product
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new NotFoundException('Product not found');
            if (product.merchantId !== merchantId) throw new ConflictException('Product belongs to another merchant');

            // 3. Verify Device
            const device = await tx.device.findUnique({ where: { id: deviceId } });
            if (!device) throw new NotFoundException('Device not found');
            if (device.merchantId !== merchantId && !device.merchantId) {
                // If device has no merchant, claim it? Or strict check?
                // Strict check: Device must be in merchant inventory
                throw new ConflictException('Device not in merchant inventory');
            }
            if (device.merchantId !== merchantId) throw new ConflictException('Device belongs to another merchant');

            // 4. Calculate Loan
            // We can reuse the logic, but we need to do it within the transaction context ideally?
            // Since calculateLoan is read-only (mostly), we can re-implement or call it (but validation is repeated).
            // Let's iterate on simple calculation here for transaction safety or just trust the logic.
            // Re-use logic:
            if (tenureMonths < product.minTenure || tenureMonths > product.maxTenure) {
                throw new BadRequestException(`Tenure must be between ${product.minTenure} and ${product.maxTenure}`);
            }

            const price = Number(product.price);
            const minDown = Number(product.minDownPayment);
            if (downPayment < minDown) throw new BadRequestException(`Minimum down payment is ${minDown}`);

            const principal = price - downPayment;
            const monthlyRate = Number(product.interestRate) / 100;
            const totalInterest = principal * monthlyRate * tenureMonths;
            const totalRepayment = principal + totalInterest;
            const monthlyAmount = totalRepayment / tenureMonths;

            // 5. Create Loan
            const loan = await tx.loan.create({
                data: {
                    userId: customerId,
                    merchantId: merchantId,
                    deviceId: deviceId,
                    productId: productId,
                    principalAmount: principal,
                    interestRate: Number(product.interestRate),
                    totalAmount: totalRepayment,
                    status: 'PENDING', // Waiting for down payment? Or ACTIVE if manual? Let's say PENDING.
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + tenureMonths)),
                    currency: product.currency
                }
            });

            // 6. Create Installments
            const installments: any[] = [];
            const startDate = new Date();
            let currentDate = new Date(startDate);

            for (let i = 1; i <= tenureMonths; i++) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                installments.push({
                    loanId: loan.id,
                    dueDate: new Date(currentDate),
                    amountDue: Math.round(monthlyAmount * 100) / 100, // Round to 2 decimals
                    status: 'PENDING'
                });
            }

            // Using createMany for better performance
            await tx.installment.createMany({
                data: installments
            });

            // 7. Update Device
            await tx.device.update({
                where: { id: deviceId },
                data: {
                    userId: customerId,
                    status: 'ASSIGNED' // or LOCKED until paid?
                }
            });

            return loan;
        });
    }
}
