import { Injectable } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class ProductsService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    async create(merchantId: string, data: any) {
        return this.prisma.product.create({
            data: {
                ...data,
                merchantId,
                // Ensure decimals are handled if needed, usually passed as numbers/strings
            }
        });
    }

    async findAll(merchantId: string) {
        return this.prisma.product.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, merchantId?: string) {
        const where: any = { id };
        if (merchantId) where.merchantId = merchantId;

        return this.prisma.product.findFirst({
            where
        });
    }

    async update(id: string, merchantId: string, data: any) {
        // Ensure belongs to merchant
        const product = await this.prisma.product.findFirst({ where: { id, merchantId } });
        if (!product) throw new Error('Product not found or access denied');

        return this.prisma.product.update({
            where: { id },
            data
        });
    }

    async getAgentCatalog(agentUserId: string) {
        // Get agent's merchant ID
        const agent = await this.prisma.user.findUnique({
            where: { id: agentUserId },
            select: { merchantId: true }
        });

        if (!agent || !agent.merchantId) {
            return [];
        }

        // Return products for agent's merchant
        return this.findAll(agent.merchantId);
    }
}
