import { Test, TestingModule } from '@nestjs/testing';
import { MerchantApplicationService } from './merchant-application.service';
import { EmailService } from '../email/email.service';
import { CreditServiceAdapter } from '../integration/credit-service.adapter';

const mockPrismaClient = {
    merchantApplication: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
};

const mockEmailService = {
    sendApplicationConfirmation: jest.fn(),
};

const mockCreditService = {
    assessMerchantRisk: jest.fn(),
};

describe('MerchantApplicationService', () => {
    let service: MerchantApplicationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MerchantApplicationService,
                { provide: EmailService, useValue: mockEmailService },
                { provide: CreditServiceAdapter, useValue: mockCreditService },
            ],
        }).compile();

        service = module.get<MerchantApplicationService>(MerchantApplicationService);
        // Inject mock prisma
        (service as any).prisma = mockPrismaClient;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicates', () => {
        it('should return no duplicates if none exist', async () => {
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValue(null);

            const result = await service.checkDuplicates('test@example.com', '123', 'Biz');

            expect(result).toEqual({
                emailExists: false,
                phoneExists: false,
                businessExists: false,
                canProceed: true
            });
        });

        it('should detect duplicate email', async () => {
            // First call is email, second is phone, third is business
            mockPrismaClient.merchantApplication.findFirst
                .mockResolvedValueOnce({ id: 'existing' }) // Email
                .mockResolvedValueOnce(null) // Phone
                .mockResolvedValueOnce(null); // Business

            const result = await service.checkDuplicates('test@example.com', '123', 'Biz');

            expect(result.emailExists).toBe(true);
            expect(result.canProceed).toBe(false);
        });
    });

    describe('submitApplication', () => {
        const validData = {
            email: 'new@example.com',
            phone: '1234567890',
            businessName: 'New Biz',
            directors: [],
        };

        it('should throw error if email exists', async () => {
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValueOnce({ id: 'exists' });

            await expect(service.submitApplication(validData)).rejects.toThrow('email already exists');
        });

        it('should throw error if business name exists (case insensitive)', async () => {
            // Email ok
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValueOnce(null);
            // Phone ok
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValueOnce(null);
            // Business name Exists
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValueOnce({ id: 'exists' });

            await expect(service.submitApplication(validData)).rejects.toThrow('business name already exists');
        });

        it('should create application if checks pass', async () => {
            mockPrismaClient.merchantApplication.findFirst.mockResolvedValue(null);
            mockPrismaClient.merchantApplication.create.mockResolvedValue({ id: 'new-id', ...validData });

            const result = await service.submitApplication(validData);

            expect(result.id).toBe('new-id');
            expect(mockPrismaClient.merchantApplication.create).toHaveBeenCalled();
        });

        it('should use idempotency cache', async () => {
            const key = 'idem-key-123';
            // Mock existing cache logic manually or implicitly via repeated calls
            // Since we can't easily access the private map in the test without casting,
            // we'll test by calling twice and ensuring Prisma only called once.

            mockPrismaClient.merchantApplication.findFirst.mockResolvedValue(null);
            mockPrismaClient.merchantApplication.create.mockResolvedValue({ id: 'cached-id', ...validData });

            // First call
            await service.submitApplication(validData, key);

            // Second call with same key
            const result2 = await service.submitApplication(validData, key);

            expect(result2.id).toBe('cached-id');
            expect(mockPrismaClient.merchantApplication.create).toHaveBeenCalledTimes(1);
        });
    });
});
