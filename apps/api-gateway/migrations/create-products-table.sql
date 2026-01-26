-- Products Table Migration
-- Run this SQL to create the products table

CREATE TABLE IF NOT EXISTS products (
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

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_branch ON products(branch_id);

-- Insert sample products for testing
INSERT INTO products (merchant_id, name, brand, model, os_type, retail_price, bnpl_eligible, max_tenure_months, lock_support, status)
VALUES 
    ('test-merchant-id', 'Samsung Galaxy A15', 'Samsung', 'A15', 'Android', 150000.00, true, 6, true, 'active'),
    ('test-merchant-id', 'iPhone 13', 'Apple', '13', 'iOS', 450000.00, true, 12, true, 'active'),
    ('test-merchant-id', 'Tecno Spark 10', 'Tecno', 'Spark 10', 'Android', 85000.00, true, 4, true, 'active');
