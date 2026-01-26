const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function checkProductsTable() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check if products table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'products'
            );
        `);
        console.log('\n📋 Products table exists:', tableCheck.rows[0].exists);

        if (tableCheck.rows[0].exists) {
            // Get table structure
            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'products'
                ORDER BY ordinal_position;
            `);
            console.log('\n📊 Table structure:');
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });

            // Check constraints
            const constraints = await client.query(`
                SELECT constraint_name, constraint_type
                FROM information_schema.table_constraints
                WHERE table_name = 'products';
            `);
            console.log('\n🔒 Constraints:');
            constraints.rows.forEach(c => {
                console.log(`  - ${c.constraint_name}: ${c.constraint_type}`);
            });

            // Try to count rows
            const count = await client.query('SELECT COUNT(*) FROM products');
            console.log(`\n📦 Current products count: ${count.rows[0].count}`);
        } else {
            console.log('\n⚠️  Table does not exist! TypeORM should create it.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkProductsTable();
