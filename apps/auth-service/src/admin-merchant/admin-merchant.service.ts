import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class AdminMerchantService {
    private prisma = new PrismaClient();

    async findAll(status?: string, search?: string) {
        const where: any = {
            role: 'MERCHANT',
            merchantProfile: {
                deletedAt: null // Exclude soft-deleted merchants
            }
        };

        if (status) {
            where.merchantProfile = {
                status: status
            };
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { merchantProfile: { businessName: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const merchants = await this.prisma.user.findMany({
            where,
            include: {
                merchantProfile: true, // Include profile for status/business name
                _count: {
                    select: { devices: true } // Return device count usage
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to cleaner DTO if needed, but returning raw is faster for now
        return merchants.map(m => ({
            id: m.id,
            email: m.email,
            businessName: m.merchantProfile?.businessName || 'N/A',
            status: m.merchantProfile?.status || 'PENDING',
            maxDevices: m.merchantProfile?.maxDevices || 10,
            usedDevices: m._count.devices,
            joinedAt: m.createdAt
        }));
    }

    async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
        // Find merchant profile ID
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { merchantProfile: true }
        });

        if (!user || !user.merchantProfile) throw new NotFoundException('Merchant not found');

        return this.prisma.merchantProfile.update({
            where: { id: user.merchantProfile.id },
            data: { status }
        });
    }

    async updateLimits(id: string, maxDevices: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { merchantProfile: true }
        });

        if (!user || !user.merchantProfile) throw new NotFoundException('Merchant not found');

        return this.prisma.merchantProfile.update({
            where: { id: user.merchantProfile.id },
            data: { maxDevices: Number(maxDevices) }
        });
    }

    async createFromApplication(applicationId: string, dto: { passwordHash: string, maxDevices: number, maxAgents: number }) {
        const application = await this.prisma.merchantApplication.findUnique({
            where: { id: applicationId }
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.status !== 'APPROVED') throw new Error('Application must be APPROVED before creation');

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: application.email }
        });
        if (existingUser) throw new Error('User with this email already exists');

        return this.prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: application.email,
                    password: dto.passwordHash, // Expected to be pre-hashed in controller or here? Controller for simplicity
                    role: 'MERCHANT',
                    merchantProfile: {
                        create: {
                            businessName: application.businessName,
                            businessType: (application.businessType as any) || 'SOLE_PROPRIETORSHIP' as any,
                            rcNumber: application.cacNumber || 'PENDING',
                            dateOfIncorporation: application.dateOfIncorporation,
                            businessAddress: application.businessAddress,
                            operatingAddress: application.operatingAddress || application.businessAddress,
                            directorName: application.contactName,
                            directorPhone: application.phone,
                            maxDevices: dto.maxDevices,
                            maxAgents: dto.maxAgents,
                            status: 'APPROVED',
                            enabledDeviceTypes: JSON.stringify(["ANDROID"])
                        }
                    }
                }
            });

            // 2. Link User to Application (if we added a userId field to Application, but providing status update is enough for now)
            // We'll just mark application as fully processed if needed, or leave as APPROVED.
            // Let's essentially "Archive" it or ensure we don't double create.
            // For now, checks existingUser prevents double creation.

            return user;
        });
    }

    // Archive merchant (soft delete) - set deletedAt timestamp
    async archiveMerchant(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { merchantProfile: true }
        });

        if (!user || !user.merchantProfile) throw new NotFoundException('Merchant not found');

        // Soft delete the merchant profile
        return this.prisma.merchantProfile.update({
            where: { id: user.merchantProfile.id },
            data: { deletedAt: new Date() }
        });
    }

    // Delete merchant permanently (hard delete)
    async deleteMerchant(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { merchantProfile: true }
        });

        if (!user || !user.merchantProfile) throw new NotFoundException('Merchant not found');

        // Hard delete - remove merchant profile and user
        return this.prisma.$transaction(async (tx) => {
            // Delete merchant profile first
            await tx.merchantProfile.delete({
                where: { id: user.merchantProfile.id }
            });

            // Delete user
            await tx.user.delete({
                where: { id }
            });

            return { message: 'Merchant deleted successfully' };
        });
    }
}
