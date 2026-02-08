// Test script to verify loan partners API endpoint
const API_URL = 'https://vistalock-api.onrender.com';

async function testLoanPartnersAPI() {
    try {
        console.log('🧪 Testing loan partners API endpoint...\n');
        console.log(`API URL: ${API_URL}/loan-partners\n`);

        const response = await fetch(`${API_URL}/loan-partners`);

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('');

        if (!response.ok) {
            console.log('❌ API request failed');
            const text = await response.text();
            console.log('Response:', text);
            return;
        }

        const data = await response.json();

        console.log('✅ API Response:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');
        console.log(`Found ${data.length} loan partner(s)`);

        if (data.length === 0) {
            console.log('\n⚠️  API returned empty array - loan partners not in database or not active');
        } else {
            console.log('\n📋 Loan Partners:');
            data.forEach((partner: any, index: number) => {
                console.log(`${index + 1}. ${partner.name} (ID: ${partner.id})`);
            });
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

testLoanPartnersAPI();
