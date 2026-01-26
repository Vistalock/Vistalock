-- Delete existing merchant@test.com if exists
DELETE FROM "User" WHERE email = 'merchant@test.com';

-- Insert fresh merchant account
INSERT INTO "User" ("id", "email", "password", "role", "isActive", "createdAt", "updatedAt", "subscriptionPlan", "apiKey")
VALUES (
    'merchant-test-001', 
    'merchant@test.com', 
    '$2b$10$rC8Al6NI6EKtwac/aSXMMe227APhq.PH.LuCDXXddGQWiDqCxWYpsW', 
    'MERCHANT', 
    true,
    NOW(),
    NOW(),
    'STARTER',
    'api_key_merchant_test_001'
);
