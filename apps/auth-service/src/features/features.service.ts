import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../billing/wallet.service';
import {
    CreateFeatureDto,
    UpdateFeatureDto,
    SubscribeToFeatureDto,
    FeatureSubscriptionQueryDto,
    CreateFeatureRequestDto,
    UpdateFeatureRequestDto,
    FeatureRequestQueryDto
} from './dto';

@Injectable()
export class FeaturesService {
    private readonly logger = new Logger(FeaturesService.name);

    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) { }

    // ==================== FEATURE CATALOG ====================

    /**
     * Get all active features (merchant view)
     */
    async findAllActive() {
        return this.prisma.feature.findMany({
            where: { isActive: true },
            orderBy: [
                { category: 'asc' },
                { price: 'asc' }
            ]
        });
    }

    /**
     * Get all features (admin view)
     */
    async findAll() {
        return this.prisma.feature.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    /**
     * Get a single feature
     */
    async findOne(id: string) {
        const feature = await this.prisma.feature.findUnique({
            where: { id }
        });

        if (!feature) {
            throw new NotFoundException('Feature not found');
        }

        return feature;
    }

    /**
     * Create a new feature (admin)
     */
    async create(dto: CreateFeatureDto) {
        // Check if feature with same name exists
        const existing = await this.prisma.feature.findFirst({
            where: { name: dto.name }
        });

        if (existing) {
            throw new ConflictException(`Feature "${dto.name}" already exists`);
        }

        const feature = await this.prisma.feature.create({
            data: {
                name: dto.name,
                description: dto.description,
                category: dto.category,
                pricingType: dto.pricingType,
                price: dto.price,
                isActive: true,
                metadata: dto.metadata || {}
            }
        });

        this.logger.log(`Created feature: ${feature.name} (₦${feature.price}/${feature.pricingType})`);

        return feature;
    }

    /**
     * Update a feature (admin)
     */
    async update(id: string, dto: UpdateFeatureDto) {
        await this.findOne(id);

        const feature = await this.prisma.feature.update({
            where: { id },
            data: dto
        });

        this.logger.log(`Updated feature: ${feature.name}`);

        return feature;
    }

    /**
     * Delete a feature (admin)
     */
    async delete(id: string) {
        await this.findOne(id);

        // Check if feature has active subscriptions
        const activeSubscriptions = await this.prisma.featureSubscription.count({
            where: {
                featureId: id,
                status: 'ACTIVE'
            }
        });

        if (activeSubscriptions > 0) {
            throw new BadRequestException(`Cannot delete feature with ${activeSubscriptions} active subscriptions`);
        }

        await this.prisma.feature.delete({
            where: { id }
        });

        this.logger.log(`Deleted feature: ${id}`);

        return { success: true, message: 'Feature deleted successfully' };
    }

    // ==================== FEATURE SUBSCRIPTIONS ====================

    /**
     * Get merchant's feature subscriptions
     */
    async getSubscriptions(merchantId: string, query: FeatureSubscriptionQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { merchantId };

        if (query.status) {
            where.status = query.status;
        }

        const [subscriptions, total] = await Promise.all([
            this.prisma.featureSubscription.findMany({
                where,
                skip,
                take: limit,
                include: {
                    feature: true
                },
                orderBy: { startedAt: 'desc' }
            }),
            this.prisma.featureSubscription.count({ where })
        ]);

        return {
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Subscribe to a feature
     */
    async subscribe(merchantId: string, dto: SubscribeToFeatureDto) {
        const feature = await this.findOne(dto.featureId);

        // Check if already subscribed
        const existing = await this.prisma.featureSubscription.findFirst({
            where: {
                merchantId,
                featureId: dto.featureId,
                status: 'ACTIVE'
            }
        });

        if (existing) {
            throw new ConflictException('Already subscribed to this feature');
        }

        // For FLAT_MONTHLY and ONE_TIME, charge immediately
        if (feature.pricingType === 'FLAT_MONTHLY' || feature.pricingType === 'ONE_TIME') {
            const hasSufficientBalance = await this.walletService.hasSufficientBalance(
                merchantId,
                Number(feature.price)
            );

            if (!hasSufficientBalance) {
                throw new BadRequestException(
                    `Insufficient wallet balance. Required: ₦${feature.price}. Please top up your wallet.`
                );
            }

            // Deduct from wallet
            await this.walletService.deduct(
                merchantId,
                Number(feature.price),
                `Feature subscription: ${feature.name}`,
                `FEATURE-${feature.id}`
            );
        }

        // Create subscription
        const subscription = await this.prisma.featureSubscription.create({
            data: {
                merchantId,
                featureId: dto.featureId,
                status: 'ACTIVE',
                startedAt: new Date()
            },
            include: {
                feature: true
            }
        });

        this.logger.log(`Merchant ${merchantId} subscribed to feature: ${feature.name}`);

        return {
            success: true,
            subscription,
            message: feature.pricingType === 'PER_DEVICE'
                ? `Subscribed to ${feature.name}. You will be charged ₦${feature.price} per device.`
                : `Subscribed to ${feature.name}. ₦${feature.price} charged from your wallet.`
        };
    }

    /**
     * Cancel a feature subscription
     */
    async cancelSubscription(merchantId: string, subscriptionId: string) {
        const subscription = await this.prisma.featureSubscription.findFirst({
            where: {
                id: subscriptionId,
                merchantId
            },
            include: {
                feature: true
            }
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        if (subscription.status === 'CANCELLED') {
            throw new BadRequestException('Subscription already cancelled');
        }

        // Update subscription
        const updated = await this.prisma.featureSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        });

        this.logger.log(`Merchant ${merchantId} cancelled subscription: ${subscription.feature.name}`);

        return {
            success: true,
            subscription: updated,
            message: 'Subscription cancelled successfully'
        };
    }

    /**
     * Check if merchant has a specific feature
     */
    async hasFeature(merchantId: string, featureName: string): Promise<boolean> {
        const subscription = await this.prisma.featureSubscription.findFirst({
            where: {
                merchantId,
                status: 'ACTIVE',
                feature: {
                    name: featureName,
                    isActive: true
                }
            }
        });

        return !!subscription;
    }

    // ==================== FEATURE REQUESTS ====================

    /**
     * Get merchant's feature requests
     */
    async getRequests(merchantId: string, query: FeatureRequestQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { merchantId };

        if (query.status) {
            where.status = query.status;
        }

        const [requests, total] = await Promise.all([
            this.prisma.featureRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.featureRequest.count({ where })
        ]);

        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create a feature request
     */
    async createRequest(merchantId: string, dto: CreateFeatureRequestDto) {
        const request = await this.prisma.featureRequest.create({
            data: {
                merchantId,
                title: dto.title,
                description: dto.description,
                useCase: dto.useCase,
                budget: dto.budget,
                status: 'PENDING'
            }
        });

        this.logger.log(`Feature request created by merchant ${merchantId}: ${request.title}`);

        return {
            success: true,
            request,
            message: 'Feature request submitted successfully. Our team will review it shortly.'
        };
    }

    /**
     * Get all feature requests (admin)
     */
    async getAllRequests(query: FeatureRequestQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.status) {
            where.status = query.status;
        }

        const [requests, total] = await Promise.all([
            this.prisma.featureRequest.findMany({
                where,
                skip,
                take: limit,
                include: {
                    merchant: {
                        select: {
                            id: true,
                            email: true,
                            merchantProfile: {
                                select: {
                                    businessName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.featureRequest.count({ where })
        ]);

        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Update a feature request (admin)
     */
    async updateRequest(requestId: string, dto: UpdateFeatureRequestDto) {
        const request = await this.prisma.featureRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new NotFoundException('Feature request not found');
        }

        const updated = await this.prisma.featureRequest.update({
            where: { id: requestId },
            data: dto
        });

        this.logger.log(`Feature request ${requestId} updated to status: ${updated.status}`);

        return updated;
    }

    /**
     * Get feature subscription statistics (admin)
     */
    async getSubscriptionStats() {
        const features = await this.findAll();

        const stats = await Promise.all(
            features.map(async (feature) => {
                const subscriptionCount = await this.prisma.featureSubscription.count({
                    where: {
                        featureId: feature.id,
                        status: 'ACTIVE'
                    }
                });

                // Calculate monthly revenue
                let monthlyRevenue = 0;
                if (feature.pricingType === 'FLAT_MONTHLY') {
                    monthlyRevenue = subscriptionCount * Number(feature.price);
                }

                return {
                    feature: feature.name,
                    category: feature.category,
                    pricingType: feature.pricingType,
                    price: feature.price,
                    activeSubscriptions: subscriptionCount,
                    monthlyRevenue,
                    isActive: feature.isActive
                };
            })
        );

        return stats;
    }
}
