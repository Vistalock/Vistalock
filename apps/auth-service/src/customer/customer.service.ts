import { Injectable, BadRequestException } from '@nestjs/common';
// @ts-ignore
import { prisma, KycStatus, Role } from '@vistalock/database';

@Injectable()
export class CustomerService {

    async sendOtp(phoneNumber: string) {
        // Mock OTP generation: Always 123456 for MVP testing
        const code = '123456';
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.otpRequest.create({
            data: { phoneNumber, code, expiresAt }
        });

        console.log(`[Mock SMS] Sent OTP ${code} to ${phoneNumber}`);
        return { message: 'OTP sent successfully' };
    }

    async verifyOtp(phoneNumber: string, code: string) {
        const otpRecord = await prisma.otpRequest.findFirst({
            where: { phoneNumber, code, verified: false },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        await prisma.otpRequest.update({ where: { id: otpRecord.id }, data: { verified: true } });

        // Find or Create User (Customer Role) with dummy credentials
        const email = `${phoneNumber}@vistalock.customer`;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    password: 'default_password',
                    role: Role.CUSTOMER
                }
            });
        }

        // Ensure CustomerProfile exists
        let profile = await prisma.customerProfile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            profile = await prisma.customerProfile.create({
                data: { userId: user.id, phoneNumber }
            });
        }

        return {
            message: 'Phone verified',
            userId: user.id,
            customerId: profile.id,
            profile
        };
    }

    async verifyId(userId: string, type: 'BVN' | 'NIN', value: string) {
        console.log(`[Dojah] Verifying ${type}: ${value} for User ${userId}`);

        // Mock Response (Simulating Dojah)
        if (value === '00000000000') throw new BadRequestException('Invalid ID');

        // Persist Data
        await prisma.customerProfile.update({
            where: { userId },
            data: {
                firstName: 'Jane',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                [type.toLowerCase()]: value
            }
        });

        return {
            valid: true,
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            photoUrl: 'https://placehold.co/200x200.png',
            [type.toLowerCase()]: value
        };
    }

    async checkCredit(userId: string, bvn: string) {
        console.log(`[Dojah] Checking Credit for User ${userId} (BVN: ${bvn})`);

        const score = 750;
        const qualified = score > 500;

        if (qualified) {
            await prisma.customerProfile.update({
                where: { userId },
                data: { kycStatus: KycStatus.VERIFIED, creditScore: score }
            });
        } else {
            await prisma.customerProfile.update({
                where: { userId },
                data: { kycStatus: KycStatus.FAILED, creditScore: score }
            });
        }

        return { qualified, score };
    }
}
