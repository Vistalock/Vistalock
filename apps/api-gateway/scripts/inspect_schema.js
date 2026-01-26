const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function inspectTable() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Get column details
        const res = await client.query(`
            SELECT column_name, data_type, udt_name, is_nullable, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);

        console.log('\n📊 Table Schema for "products":');
        console.table(res.rows);

        // Get constraints
        const constraints = await client.query(`
            SELECT conname as constraint_name, contype as constraint_type, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conrelid = 'products'::regclass;
        `);

        console.log('\n🔒 Constraints:');
        console.table(constraints.rows);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

inspectTable();
