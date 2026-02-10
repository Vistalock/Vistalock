import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TopUpWalletDto, WalletTransactionQueryDto } from './dto';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get or create wallet for a merchant
     */
    async getOrCreateWallet(merchantId: string) {
        let wallet = await this.prisma.merchantWallet.findUnique({
            where: { merchantId }
        });

        if (!wallet) {
            wallet = await this.prisma.merchantWallet.create({
                data: {
                    merchantId,
                    balance: 0,
                    currency: 'NGN',
                    status: 'ACTIVE'
                }
            });
            this.logger.log(`Created wallet for merchant ${merchantId}`);
        }

        return wallet;
    }

    /**
     * Get wallet balance
     */
    async getBalance(merchantId: string) {
        const wallet = await this.getOrCreateWallet(merchantId);
        return {
            balance: wallet.balance,
            currency: wallet.currency,
            status: wallet.status
        };
    }

    /**
     * Initiate wallet top-up
     */
    async initiateTopUp(merchantId: string, dto: TopUpWalletDto) {
        const wallet = await this.getOrCreateWallet(merchantId);

        if (wallet.status !== 'ACTIVE') {
            throw new BadRequestException('Wallet is not active');
        }

        // Generate payment reference
        const reference = this.generatePaymentReference();

        // TODO: Integrate with Paystack
        // For now, return mock payment URL
        const paymentUrl = `https://paystack.com/pay/${reference}`;

        this.logger.log(`Initiated top-up for merchant ${merchantId}: ₦${dto.amount}`);

        return {
            paymentUrl,
            reference,
            amount: dto.amount,
            message: 'Complete payment to top up your wallet'
        };
    }

    /**
     * Process successful payment (called by Paystack webhook)
     */
    async processPayment(reference: string, amount: number, merchantId: string) {
        const wallet = await this.getOrCreateWallet(merchantId);

        // Create credit transaction
        await this.createTransaction(
            wallet.id,
            merchantId,
            'CREDIT',
            amount,
            reference,
            'Wallet top-up via Paystack'
        );

        this.logger.log(`Processed payment for merchant ${merchantId}: ₦${amount}`);

        return {
            success: true,
            newBalance: wallet.balance,
            message: 'Payment processed successfully'
        };
    }

    /**
     * Deduct from wallet (for enrollment fees, subscriptions)
     */
    async deduct(merchantId: string, amount: number, description: string, reference?: string) {
        const wallet = await this.getOrCreateWallet(merchantId);

        if (Number(wallet.balance) < amount) {
            throw new BadRequestException(`Insufficient wallet balance. Required: ₦${amount}, Available: ₦${wallet.balance}`);
        }

        // Create debit transaction
        await this.createTransaction(
            wallet.id,
            merchantId,
            'DEBIT',
            amount,
            reference,
            description
        );

        this.logger.log(`Deducted ₦${amount} from merchant ${merchantId} wallet: ${description}`);

        return {
            success: true,
            amountDeducted: amount,
            newBalance: wallet.balance
        };
    }

    /**
     * Get transaction history
     */
    async getTransactions(merchantId: string, query: WalletTransactionQueryDto) {
        const wallet = await this.getOrCreateWallet(merchantId);

        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { walletId: wallet.id };

        if (query.type) {
            where.type = query.type;
        }

        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        const [transactions, total] = await Promise.all([
            this.prisma.walletTransaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.walletTransaction.count({ where })
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create a wallet transaction
     */
    private async createTransaction(
        walletId: string,
        merchantId: string,
        type: 'CREDIT' | 'DEBIT',
        amount: number,
        reference: string | undefined,
        description: string
    ) {
        // Get current wallet
        const wallet = await this.prisma.merchantWallet.findUnique({
            where: { id: walletId }
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const balanceBefore = wallet.balance;
        const balanceAfter = type === 'CREDIT'
            ? Number(balanceBefore) + amount
            : Number(balanceBefore) - amount;

        // Create transaction and update wallet in a transaction
        return this.prisma.$transaction(async (tx) => {
            // Create transaction record
            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId,
                    merchantId,
                    type,
                    amount,
                    balanceBefore,
                    balanceAfter,
                    reference,
                    description
                }
            });

            // Update wallet balance
            await tx.merchantWallet.update({
                where: { id: walletId },
                data: { balance: balanceAfter }
            });

            return transaction;
        });
    }

    /**
     * Check if merchant has sufficient balance
     */
    async hasSufficientBalance(merchantId: string, amount: number): Promise<boolean> {
        const wallet = await this.getOrCreateWallet(merchantId);
        return Number(wallet.balance) >= amount;
    }

    /**
     * Generate payment reference
     */
    private generatePaymentReference(): string {
        return `VL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }
}
