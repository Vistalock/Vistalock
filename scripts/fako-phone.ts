// @ts-nocheck
const fetch = global.fetch;

// Config
const GATEWAY_URL = 'http://localhost:3000';
const POLLING_INTERVAL_MS = 5000;
const DEVICE_COUNT = 5;

// Generate test IMEIs (must match Seed)
// Seed used: 358921090000000 ...
const devices = Array.from({ length: DEVICE_COUNT }).map((_, i) => ({
    imei: `35892109000${i.toString().padStart(4, '0')}`,
    name: `Device-${i + 1}`,
    lastStatus: 'UNKNOWN'
}));

async function runDeviceLoop() {
    console.log(`📱 Fako-Phone Simulator Starting...`);
    console.log(`Target: ${GATEWAY_URL}`);
    console.log(`Simulating ${devices.length} devices.`);
    console.log('-------------------------------------------');

    setInterval(async () => {
        const time = new Date().toLocaleTimeString();

        for (const device of devices) {
            try {
                // 1. Send Heartbeat
                await fetch(`${GATEWAY_URL}/devices/${device.imei}/heartbeat`, { method: 'POST' });

                // 2. Message Check (Poll Status)
                const res = await fetch(`${GATEWAY_URL}/devices/${device.imei}/status`);
                if (res.ok) {
                    const data = await res.json();
                    const newStatus = data.status; // LOCKED or UNLOCKED

                    // Only log if status changed or just periodically to show life
                    if (newStatus !== device.lastStatus) {
                        if (newStatus === 'LOCKED') {
                            console.log(`[${time}] ${device.name} (${device.imei}) 🔒 >>> SYSTEM LOCK ACTIVATED <<<`);
                        } else if (newStatus === 'UNLOCKED') {
                            console.log(`[${time}] ${device.name} (${device.imei}) 🔓 Device Unlocked`);
                        }
                        device.lastStatus = newStatus;
                    } else {
                        // Verbose heartbeat log (optional, maybe too noisy?)
                        // console.log(`[${time}] ${device.name} ❤️ Heartbeat OK (${newStatus})`);
                    }
                }
            } catch (e) {
                console.error(`[${time}] ${device.name} ❌ Connection Error: ${e.message}`);
            }
        }
    }, POLLING_INTERVAL_MS);
}

runDeviceLoop();
