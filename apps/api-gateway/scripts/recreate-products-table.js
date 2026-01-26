const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function recreateProductsTable() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Drop existing table if it exists
        await client.query('DROP TABLE IF EXISTS products CASCADE');
        console.log('🗑️  Dropped existing products table');

        // Create fresh products table matching the entity
        await client.query(`
            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                merchant_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                os_type VARCHAR(20) NOT NULL CHECK (os_type IN ('Android', 'iOS')),
                retail_price DECIMAL(10,2) NOT NULL,
                bnpl_eligible BOOLEAN DEFAULT true,
                max_tenure_months INT DEFAULT 6,
                down_payment DECIMAL(10,2),
                lock_support BOOLEAN DEFAULT true,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                branch_id UUID,
                stock_quantity INT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Created products table');

        // Create indexes
        await client.query('CREATE INDEX idx_products_merchant ON products(merchant_id)');
        await client.query('CREATE INDEX idx_products_status ON products(status)');
        console.log('✅ Created indexes');

        console.log('\n🎉 Products table ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

recreateProductsTable();
