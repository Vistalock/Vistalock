require('dotenv').config();
const twilio = require('twilio');

async function testTwilio() {
    console.log('Testing Twilio Configuration...');

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    const to = '+2347049159042'; // User's number

    console.log(`SID: ${sid ? sid.substring(0, 4) + '...' : 'MISSING'}`);
    console.log(`Token: ${token ? 'PRESENT' : 'MISSING'}`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);

    if (!sid || !token || !from) {
        console.error('❌ Missing credentials in .env');
        return;
    }

    const client = twilio(sid, token);

    try {
        const message = await client.messages.create({
            body: 'VistaLock Test SMS. If you see this, integration works!',
            from: from,
            to: to
        });
        console.log(`✅ SMS Sent! SID: ${message.sid}`);
    } catch (error) {
        console.error('❌ Failed to send SMS:');
        console.error(error.message);
        if (error.code) console.error(`Code: ${error.code}`);
    }
}

testTwilio();
