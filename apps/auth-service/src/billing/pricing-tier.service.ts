import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePricingTierDto, UpdatePricingTierDto } from './dto';

@Injectable()
export class PricingTierService {
    private readonly logger = new Logger(PricingTierService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get all active pricing tiers
     */
    async findAll() {
        return this.prisma.pricingTier.findMany({
            where: { isActive: true },
            orderBy: { minVolume: 'asc' }
        });
    }

    /**
     * Get all pricing tiers (admin)
     */
    async findAllAdmin() {
        return this.prisma.pricingTier.findMany({
            orderBy: { minVolume: 'asc' }
        });
    }

    /**
     * Get a single pricing tier
     */
    async findOne(id: string) {
        const tier = await this.prisma.pricingTier.findUnique({
            where: { id }
        });

        if (!tier) {
            throw new NotFoundException('Pricing tier not found');
        }

        return tier;
    }

    /**
     * Create a new pricing tier (admin)
     */
    async create(dto: CreatePricingTierDto) {
        // Check for overlapping volume ranges
        const overlapping = await this.prisma.pricingTier.findFirst({
            where: {
                isActive: true,
                OR: [
                    {
                        AND: [
                            { minVolume: { lte: dto.minVolume } },
                            dto.maxVolume ? { maxVolume: { gte: dto.minVolume } } : { maxVolume: null }
                        ]
                    },
                    dto.maxVolume ? {
                        AND: [
                            { minVolume: { lte: dto.maxVolume } },
                            { maxVolume: { gte: dto.maxVolume } }
                        ]
                    } : {}
                ]
            }
        });

        if (overlapping) {
            throw new BadRequestException(`Volume range overlaps with existing tier: ${overlapping.name}`);
        }

        const tier = await this.prisma.pricingTier.create({
            data: {
                name: dto.name,
                minVolume: dto.minVolume,
                maxVolume: dto.maxVolume,
                pricePerDevice: dto.pricePerDevice,
                currency: dto.currency || 'NGN',
                isActive: true
            }
        });

        this.logger.log(`Created pricing tier: ${tier.name} (₦${tier.pricePerDevice}/device)`);

        return tier;
    }

    /**
     * Update a pricing tier (admin)
     */
    async update(id: string, dto: UpdatePricingTierDto) {
        await this.findOne(id);

        const tier = await this.prisma.pricingTier.update({
            where: { id },
            data: dto
        });

        this.logger.log(`Updated pricing tier: ${tier.name}`);

        return tier;
    }

    /**
     * Delete a pricing tier (admin)
     */
    async delete(id: string) {
        await this.findOne(id);

        await this.prisma.pricingTier.delete({
            where: { id }
        });

        this.logger.log(`Deleted pricing tier: ${id}`);

        return { success: true, message: 'Pricing tier deleted successfully' };
    }

    /**
     * Get applicable tier for a merchant based on volume
     */
    async getApplicableTier(volume: number) {
        const tier = await this.prisma.pricingTier.findFirst({
            where: {
                isActive: true,
                minVolume: { lte: volume },
                OR: [
                    { maxVolume: { gte: volume } },
                    { maxVolume: null }
                ]
            },
            orderBy: { minVolume: 'desc' }
        });

        if (!tier) {
            // Return default tier
            return this.prisma.pricingTier.findFirst({
                where: { isActive: true },
                orderBy: { pricePerDevice: 'desc' }
            });
        }

        return tier;
    }

    /**
     * Get tier usage statistics (admin)
     */
    async getTierUsageStats() {
        const tiers = await this.findAllAdmin();

        const stats = await Promise.all(
            tiers.map(async (tier) => {
                // Count merchants in this tier
                const merchantsInTier = await this.prisma.enrollmentBilling.groupBy({
                    by: ['merchantId'],
                    where: {
                        tier: tier.name,
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                });

                // Total revenue from this tier
                const revenue = await this.prisma.enrollmentBilling.aggregate({
                    where: {
                        tier: tier.name,
                        status: 'PAID',
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    },
                    _sum: { amount: true },
                    _count: true
                });

                return {
                    tier: tier.name,
                    pricePerDevice: tier.pricePerDevice,
                    volumeRange: `${tier.minVolume}-${tier.maxVolume || '∞'}`,
                    merchantCount: merchantsInTier.length,
                    enrollmentCount: revenue._count,
                    totalRevenue: revenue._sum.amount || 0,
                    isActive: tier.isActive
                };
            })
        );

        return stats;
    }
}
