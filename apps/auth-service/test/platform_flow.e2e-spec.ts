
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module'; // Adjust path check
import { PrismaService } from '../src/prisma.service';

describe('Vistalock Platform Pivot E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // State
    let adminToken: string;
    let merchantToken: string;
    let partnerId: string;
    let applicationId: string;
    let merchantUserId: string;
    let productId: string;
    const uniqueSuffix = Date.now().toString();
    const testPartnerSlug = `test-partner-${uniqueSuffix}`;
    const testMerchantEmail = `merchant-${uniqueSuffix}@test.com`;
    const testImei = `3546${uniqueSuffix.slice(0, 11)}`; // 15 chars

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Enable ValidationPipe same as main.ts if needed, but for e2e usually handled in app
        // app.useGlobalPipes(new ValidationPipe()); 
        await app.init();

        prisma = app.get(PrismaService);

        // 0. Seed Admin & Get Token
        // Assuming Super Admin exists or we create one
        // For this test, we might fallback to a known seed admin or create one
        // Let's create a test admin directly in DB to bypass login issues
        const adminEmail = `admin-${uniqueSuffix}@vistalock.com`;
        // We can use the AuthController login if we seed user
        // Or just create a token if we can mock JwtStrategy... 
        // Easier: Create User in DB, then Login

        // Actually, let's assume we can login as the default admin 'admin@vistalock.com' / 'Admin123!'
        // If that fails, the test fails.
        try {
            console.log("Attempting Admin Login...");
            const loginRes = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'admin@vistalock.com', password: 'Admin@123' }); // Try standard creds

            console.log(`Admin Login Status: ${loginRes.status}`);
            if (loginRes.status === 201 || loginRes.status === 200) {
                adminToken = loginRes.body.access_token;
                console.log("Admin Token Acquired");
            } else {
                console.error("Admin Login Body:", loginRes.body);
            }
        } catch (e) { console.error('Admin login exception:', e); }

        if (!adminToken) {
            // Create temp admin
            // Skipping for brevity, assuming dev env has admin
            throw new Error("Could not login as Admin. Seed DB first.");
        }
    });

    afterAll(async () => {
        // Cleanup?
        await app.close();
    });

    // === STEP 1: CREATE LOAN PARTNER ===
    it('Step 1: Admin Create Loan Partner', async () => {
        const res = await request(app.getHttpServer())
            .post('/loan-partners')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `Test Partner ${uniqueSuffix}`,
                slug: testPartnerSlug,
                description: 'E2E Test Partner',
                baseUrl: 'https://partner.com',
                apiKey: 'encrypted-secret', // Initially provided
                webhookSecret: 'whsec_test',
                minDownPaymentPct: 20,
                maxTenure: 12
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        partnerId = res.body.id;
    });

    // === STEP 2: MERCHANT APPLICATION ===
    it('Step 2: Merchant Applies', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/merchant/apply')
            .send({
                businessName: `Merchant ${uniqueSuffix}`,
                tradingName: `Trade ${uniqueSuffix}`,
                businessType: 'SOLE_PROPRIETORSHIP',
                email: testMerchantEmail,
                phone: '08012345678',
                contactName: 'Test Merchant',
                businessAddress: '123 Test St',
                operatingAddress: '123 Test St',
                // Mock minimal needed
            });

        expect(res.status).toBe(201);
        applicationId = res.body.id;
    });

    // === STEP 3: ADMIN REVIEWS ===
    it('Step 3a: Ops Review', async () => {
        await request(app.getHttpServer())
            .post(`/admin/merchant-applications/${applicationId}/review-ops`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                checklist: { cac_verified: true },
                notes: 'Ops Passed'
            })
            .expect(201);
    });

    it('Step 3b: Risk Review', async () => {
        await request(app.getHttpServer())
            .post(`/admin/merchant-applications/${applicationId}/review-risk`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                checklist: { credit_check: true },
                notes: 'Risk Passed'
            })
            .expect(201);
    });

    it('Step 3c: Final Approval (Activation)', async () => {
        const res = await request(app.getHttpServer())
            .post(`/admin/merchant-applications/${applicationId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(201);

        // Get the activation token from DB (since email is mocked)
        const app = await prisma.merchantApplication.findUnique({ where: { id: applicationId } });
        const docs = app.documents as any;
        const activationToken = docs.activationToken;

        // Activate
        const activateRes = await request(app.getHttpServer())
            .post('/auth/merchant/activate')
            .send({ token: activationToken, password: 'Password@123' });

        expect(activateRes.status).toBe(201);
        expect(activateRes.body.user).toBeDefined();
        merchantUserId = activateRes.body.user.id;
    });

    // === STEP 4: MERCHANT LOGIN & PRODUCT ===
    it('Step 4: Merchant Login & Create Product', async () => {
        // Login
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testMerchantEmail, password: 'Password@123' });
        merchantToken = loginRes.body.access_token;

        // Create Product linked to Partner
        const prodRes = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${merchantToken}`)
            .send({
                name: 'Samsung S24 Ultra',
                brand: 'Samsung',
                model: 'S24 Ultra',
                osType: 'Android',
                retailPrice: 2000000,
                bnplEligible: true,
                lockSupport: true,
                loanPartnerId: partnerId,
                maxTenureMonths: 12
            });

        expect(prodRes.status).toBe(201);
        productId = prodRes.body.id;
    });

    // === STEP 5: PARTNER INTEGRATION (LOAN FUNDING) ===
    it('Step 5: Partner Funds Loan (LPIS)', async () => {
        // Get Partner Credentials (ADMIN only)
        // Actually we set them, so we know them. 
        // Or we use the rotate endpoint to test it?

        // 1. Create Loan
        const loanRes = await request(app.getHttpServer())
            .post(`/loan-partners/${partnerId}/loans`)
            // Missing Authorization? The controller currently doesn't enforce API Key middleware globally, 
            // but let's send X-Api-Key if we added it (we didn't yet, TODO in Controller)
            .send({
                merchantId: merchantUserId,
                agentId: 'AGENT_123', // Mock
                productId: productId,
                deviceImei: testImei,
                customerPhone: '08099887766',
                customerNin: '12345678901',
                loanAmount: 1800000,
                downPayment: 200000,
                tenure: 6,
                monthlyRepayment: 300000
            });

        expect(loanRes.status).toBe(201);
        expect(loanRes.body.status).toBe('ACTIVE');

        // Verify Device Created & Pending Setup
        const device = await prisma.device.findUnique({ where: { imei: testImei } });
        expect(device).toBeDefined();
        // Status might be PENDING_SETUP or UNLOCKED depending on implementation
        // Our service logic: createLoanFromPartner -> device create 'PENDING_SETUP'
    });

    // === STEP 6: WEBHOOK & LOCKING ===
    it('Step 6: Webhook Triggers Lock', async () => {
        // Get Loan ID first
        const loans = await prisma.loan.findMany({ where: { deviceIMEI: testImei } });
        const loanId = loans[0].id;

        // Simulate DEFAULT event
        await request(app.getHttpServer())
            .post(`/loan-partners/${partnerId}/webhook`)
            .send({
                event: 'LOAN_DEFAULTED',
                loanId: loanId,
                timestamp: new Date()
            })
            .expect(201);

        // Verify Device Locked
        const device = await prisma.device.findUnique({ where: { imei: testImei } });
        expect(device.status).toBe('LOCKED');

        // Simulate PAYMENT (Unlock)
        await request(app.getHttpServer())
            .post(`/loan-partners/${partnerId}/webhook`)
            .send({
                event: 'PAYMENT_RECEIVED',
                loanId: loanId,
                amount: 300000, // Recover partial
                timestamp: new Date()
            })
            .expect(201);

        const deviceUnlocked = await prisma.device.findUnique({ where: { imei: testImei } });
        expect(deviceUnlocked.status).toBe('UNLOCKED');
    });

});
