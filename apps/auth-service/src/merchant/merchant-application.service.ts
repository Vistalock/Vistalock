
import { Injectable } from '@nestjs/common';
import { PrismaClient, ApplicationStatus } from '@vistalock/database';

@Injectable()
export class MerchantApplicationService {
    private prisma = new PrismaClient();

    async submitApplication(data: any) {
        return this.prisma.merchantApplication.create({
            data: {
                // 1. Business Info
                businessName: data.businessName,
                tradingName: data.tradingName,
                businessType: data.businessType,
                cacNumber: data.cacNumber, // Optional
                dateOfIncorporation: data.dateOfIncorporation ? new Date(data.dateOfIncorporation) : undefined,
                natureOfBusiness: data.natureOfBusiness,
                website: data.website,

                // 2. Contact & Address
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                businessAddress: data.businessAddress,
                operatingAddress: data.operatingAddress,

                // 3-9. Complex Data
                directors: data.directors || [],
                signatories: data.signatories || [],
                bankDetails: data.bankDetails || {},
                operations: data.operations || {},
                deviceDetails: data.deviceDetails || {}, // Comprehensive device info
                agentDetails: data.agentDetails || {},
                documents: data.documents || {},
                compliance: data.compliance || {},

                status: ApplicationStatus.PENDING
            }
        });
    }

    async getApplications() {
        return this.prisma.merchantApplication.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async getApplication(id: string) {
        return this.prisma.merchantApplication.findUnique({
            where: { id }
        });
    }

    async approveApplication(id: string, adminId: string) {
        // Super Admin Action: Final Approval
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.APPROVED,
                processedBy: adminId
            }
        });
    }

    async reviewByOps(id: string, adminId: string) {
        // Ops Admin Action: Pass to Risk
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.OPS_REVIEWED,
                processedBy: adminId
            }
        });
    }

    async reviewByRisk(id: string, adminId: string) {
        // Risk Admin Action: Pass to Super Admin
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.RISK_REVIEWED,
                processedBy: adminId
            }
        });
    }

    async rejectApplication(id: string, adminId: string, reason: string) {
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.REJECTED,
                processedBy: adminId,
                rejectionReason: reason
            }
        });
    }
}
