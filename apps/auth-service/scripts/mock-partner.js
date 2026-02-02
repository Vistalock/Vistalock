
const axios = require('axios');
const readline = require('readline');

// CONFIG
const API_URL = 'http://localhost:3000';
const PARTNERS = {
    moniepoint: {
        id: 'moniepoint',
        key: 'vl_live_sk_moniepoint_TEST'
    },
    flexibank: {
        id: 'flexibank',
        key: 'vl_live_sk_flexibank_TEST'
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
    console.log("\n=== Vistalock Mock Loan Partner CLI ===");
    console.log("1. Use Moniepoint");
    console.log("2. Use Flexibank");

    const pChoice = await question("Select Partner [1/2]: ");
    const partner = pChoice === '2' ? PARTNERS.flexibank : PARTNERS.moniepoint;

    console.log(`\nActing as: ${partner.id.toUpperCase()}`);
    console.log("-----------------------------------");
    console.log("1. Create New Loan (POST /loans)");
    console.log("2. Simulate Webhook (POST /webhook)");
    console.log("3. Exit");

    const action = await question("Select Action [1-3]: ");

    if (action === '1') {
        await createLoan(partner);
    } else if (action === '2') {
        await sendWebhook(partner);
    } else {
        rl.close();
    }
}

async function createLoan(partner) {
    console.log("\n--- Create New Loan ---");
    const userId = await question("User ID to fund (optional): ");

    // In real flow, Partner doesn't know Vistalock UserID usually, but maps via Email/Phone.
    // LPIS v1 asks for: { amount, tenure, customer: { ... } }

    const email = await question("Customer Email: ");
    const amount = await question("Loan Amount (NGN): ");

    const payload = {
        amount: parseFloat(amount),
        tenure: 6,
        currency: "NGN",
        customer: {
            email: email,
            phone: "08012345678",
            firstName: "Test",
            lastName: "User"
        },
        device: {
            imei: "35353535353535" + Math.floor(Math.random() * 10),
            model: "Samsung A14",
            serial: "SN" + Date.now()
        },
        merchantId: "MERCHANT_ID_IF_KNOWN"
    };

    try {
        // We need the Partner's ID from DB to construct URL, OR we use the slug if allowed?
        // Controller: @Post(':id/loans')
        // We need to know the UUID.
        // HACK: We assume the user has seeded and we can find it? 
        // Or we use a helper endpoint to lookup self?
        // Let's assume the SEEDER printed the IDs and user pastes it? 
        // OR, better, we call /credentials/rotate to test? No.

        console.log("NOTE: You need the UUID of the Partner. If seeded, check console logs of seed script.");
        const partnerId = await question("Enter Partner UUID: ");

        const res = await axios.post(`${API_URL}/loan-partners/${partnerId}/loans`, payload, {
            headers: { 'x-api-key': partner.key }
        });

        console.log("✅ Loan Created:", res.data);
    } catch (e) {
        console.error("❌ Error:", e.response?.data || e.message);
    }
    rl.close();
}

async function sendWebhook(partner) {
    console.log("\n--- Send Webhook ---");
    const partnerId = await question("Enter Partner UUID: ");
    const eventType = await question("Event Type (PAYMENT_RECEIVED / PAYMENT_MISSED / LOAN_DEFAULTED): ");

    const payload = {
        event: eventType,
        loanId: "LOAN_UUID_HERE", // We'd need a real loan ID
        timestamp: new Date().toISOString()
    };

    try {
        const res = await axios.post(`${API_URL}/loan-partners/${partnerId}/webhook`, payload, {
            headers: { 'x-api-key': partner.key, 'x-webhook-signature': 'mock_sig' }
        });
        console.log("✅ Webhook Sent:", res.data);
    } catch (e) {
        console.error("❌ Error:", e.response?.data || e.message);
    }
    rl.close();
}

main();
