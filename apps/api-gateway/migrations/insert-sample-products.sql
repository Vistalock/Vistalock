-- Insert sample products for testing
-- Run this after creating the products table

INSERT INTO products (
    merchant_id, 
    name, 
    brand, 
    model, 
    os_type, 
    retail_price, 
    bnpl_eligible, 
    max_tenure_months, 
    lock_support, 
    status,
    created_at,
    updated_at
) VALUES 
(
    'test-merchant-id',
    'Samsung Galaxy A15',
    'Samsung',
    'A15',
    'Android',
    150000.00,
    true,
    6,
    true,
    'active',
    NOW(),
    NOW()
),
(
    'test-merchant-id',
    'iPhone 13',
    'Apple',
    '13',
    'iOS',
    450000.00,
    true,
    12,
    true,
    'active',
    NOW(),
    NOW()
),
(
    'test-merchant-id',
    'Tecno Spark 10',
    'Tecno',
    'Spark 10',
    'Android',
    85000.00,
    true,
    4,
    true,
    'active',
    NOW(),
    NOW()
),
(
    'test-merchant-id',
    'Infinix Note 12',
    'Infinix',
    'Note 12',
    'Android',
    95000.00,
    true,
    5,
    true,
    'active',
    NOW(),
    NOW()
),
(
    'test-merchant-id',
    'iPhone 14 Pro',
    'Apple',
    '14 Pro',
    'iOS',
    650000.00,
    true,
    12,
    true,
    'active',
    NOW(),
    NOW()
);

-- Verify products were inserted
SELECT id, name, brand, model, retail_price, status FROM products;
