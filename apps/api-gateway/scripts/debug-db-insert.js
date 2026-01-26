const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function run() {
    try {
        await client.connect();
        console.log('✅ Connected');

        const params = [
            '00000000-0000-0000-0000-000000000001', // merchant_id
            'Debug Product', // name
            'Debug Brand', // brand
            'Debug Model', // model
            'Android', // os_type
            '500000.00', // retail_price (string)
            true, // bnpl
            6, // tenure
            '100000.00', // down_payment
            true, // lock_support
            'active', // status
            10 // stock
        ];

        console.log('Params:', params);

        // Match the service query exactly
        const queryText = `
            INSERT INTO products (
                merchant_id, name, brand, model, os_type, retail_price,
                bnpl_eligible, max_tenure_months, down_payment, lock_support, status, stock_quantity
            ) VALUES (
                $1, $2, $3, $4, $5, $6::numeric, $7, $8, $9::numeric, $10, $11, $12
            ) RETURNING *
        `;

        const res = await client.query(queryText, params);
        console.log('✅ Inserted:', res.rows[0]);

    } catch (e) {
        console.error('❌ Error Code:', e.code);
        console.error('❌ Error Message:', e.message);
        console.error('❌ Error Detail:', e.detail);
        console.error('❌ Error Constraint:', e.constraint);
    } finally {
        await client.end();
    }
}

run();
