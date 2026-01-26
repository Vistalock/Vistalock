// @ts-nocheck
const fetch = global.fetch;


const BASE_URL = 'http://localhost:3001';

async function runTests() {
    console.log('🛡️ Starting API Security Verification...');
    let passed = 0;
    let failed = 0;

    async function test(name: string, fn: () => Promise<boolean>) {
        try {
            if (await fn()) {
                console.log(`✅ [PASS] ${name}`);
                passed++;
            } else {
                console.log(`❌ [FAIL] ${name}`);
                failed++;
            }
        } catch (e) {
            console.log(`❌ [FAIL] ${name} (Exception: ${e.message})`);
            failed++;
        }
    }

    // 1. Unauthenticated Access Protection
    await test('Protected Endpoint (401)', async () => {
        // Assuming /auth/profile or /users exists and is protected. 
        // If not, we check a known protected route. 
        // Let's try /auth/profile if it exists, or just verify /auth/login rejects bad method?
        // Actually, let's try a fake guarded route or just assume /users is guarded.
        // Based on previous work, AuthController has /auth/login, /auth/register.
        // UsersService might have endpoints.
        // Let's try to access a protected resource. 
        // If no explicit protected route is known, valid 401 on restricted area is good.
        // Let's try GET /auth/me or similar if implemented. 
        // If not, let's try calling a route that doesn't exist -> 404.
        // We want 401. 
        // "Auth Service" usually implements `GET /users` (protected by Admin).
        // Protected route added to AuthController
        const res = await fetch(`${BASE_URL}/auth/profile`);
        return res.status === 401 || res.status === 403;
    });

    // 2. Input Validation (DTO)
    await test('Input Validation (400) - Empty Register Body', async () => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        return res.status === 400 && Array.isArray(data.message); // class-validator returns array of errors
    });

    // 3. Rate Limiting (Headers)
    await test('Rate Limit Headers Present', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`);
        const limit = res.headers.get('x-ratelimit-limit') || res.headers.get('X-RateLimit-Limit');
        const remaining = res.headers.get('x-ratelimit-remaining') || res.headers.get('X-RateLimit-Remaining');
        if (!limit) console.log('DEBUG HEADERS:', [...res.headers.entries()]);
        return !!limit && (!!remaining || remaining === '0');
    });

    // 4. Secure Headers (Helmet)
    await test('Helmet Headers Present', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`); // Any endpoint
        const dns = res.headers.get('x-dns-prefetch-control');
        const frame = res.headers.get('x-frame-options');
        return dns === 'off' && frame === 'SAMEORIGIN';
    });

    // 5. Successful Login
    await test('Admin Login (200)', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@vistalock.com', password: 'password123' })
        });
        const data = await res.json();
        return res.status === 201 || res.status === 200 && !!data.access_token;
    });

    console.log(`\n🎉 Results: ${passed} Passed, ${failed} Failed`);
}

runTests();
