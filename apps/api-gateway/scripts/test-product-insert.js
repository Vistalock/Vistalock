const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function testInsert() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Try to insert a test product
        const result = await client.query(`
            INSERT INTO products (
                merchant_id, name, brand, model, os_type, retail_price,
                bnpl_eligible, max_tenure_months, lock_support, status
            ) VALUES (
                '00000000-0000-0000-0000-000000000001',
                'Test Product',
                'Test Brand',
                'Test Model',
                'Android',
                500000.00,
                true,
                6,
                true,
                'active'
            ) RETURNING *;
        `);

        console.log('✅ Product inserted successfully!');
        console.log('Product:', result.rows[0]);

        // Clean up
        await client.query(`DELETE FROM products WHERE name = 'Test Product'`);
        console.log('✅ Test product cleaned up');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
    }
}

testInsert();
