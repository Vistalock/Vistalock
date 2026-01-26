const axios = require('axios');

async function testCreate() {
    try {
        console.log('Testing Product Creation API...');

        const payload = {
            name: "Test API Product",
            brand: "TestBrand",
            model: "TestModel",
            osType: "Android",
            retailPrice: 500000,
            bnplEligible: true,
            maxTenureMonths: 6,
            downPayment: 100000,
            lockSupport: true,
            status: "active",
            stockQuantity: 10
        };

        console.log('Payload:', payload);

        // We need a way to authenticate or bypass auth.
        // The controller uses @Request() req, and we saw it checks req.user.
        // But we don't have a token.
        // HOWEVER, the previous code showed:
        // const merchantId = req.user?.sub || '00000000-0000-0000-0000-000000000001';
        // So it should work without auth if the Guard allows it.
        // Let's assume the Guard is permissive or we hit a 401.

        const response = await axios.post('http://localhost:3000/products', payload);
        console.log('✅ Success! Status:', response.status);
        console.log('Data:', response.data);

    } catch (error) {
        console.error('❌ Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testCreate();
