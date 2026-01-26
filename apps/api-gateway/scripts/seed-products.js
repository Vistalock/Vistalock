const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5434,  // Local isolated DB port
    user: 'postgres',
    password: '',  // Trust authentication
    database: 'vistalock',
});

async function seedProducts() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Create products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                merchant_id VARCHAR(255) NOT NULL,
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
                branch_id VARCHAR(255),
                stock_quantity INT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Products table created');

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
            CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
        `);
        console.log('✅ Indexes created');

        // Insert sample products
        await client.query(`
            INSERT INTO products (
                merchant_id, name, brand, model, os_type, retail_price, 
                bnpl_eligible, max_tenure_months, lock_support, status
            ) VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
            ($1, $11, $12, $13, $14, $15, $7, $16, $9, $10),
            ($1, $17, $18, $19, $5, $20, $7, $21, $9, $10),
            ($1, $22, $23, $24, $5, $25, $7, $26, $9, $10),
            ($1, $27, $12, $28, $14, $29, $7, $16, $9, $10)
            ON CONFLICT DO NOTHING
        `, [
            'test-merchant-id',
            'Samsung Galaxy A15', 'Samsung', 'A15', 'Android', 150000.00, true, 6, true, 'active',
            'iPhone 13', 'Apple', '13', 'iOS', 450000.00, 12,
            'Tecno Spark 10', 'Tecno', 'Spark 10', 85000.00, 4,
            'Infinix Note 12', 'Infinix', 'Note 12', 95000.00, 5,
            'iPhone 14 Pro', '14 Pro', 650000.00
        ]);
        console.log('✅ Sample products inserted');

        // Verify
        const result = await client.query('SELECT id, name, brand, retail_price FROM products');
        console.log(`\n📱 ${result.rows.length} products in database:`);
        result.rows.forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - ₦${parseFloat(p.retail_price).toLocaleString()}`);
        });

        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

seedProducts();
