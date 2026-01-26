
INSERT INTO "User" ("id", "email", "password", "role", "isActive", "createdAt", "updatedAt", "subscriptionPlan", "apiKey")
VALUES (
    'merchant-001', 
    'merchant@test.com', 
    '$2b$10$piuf/xv4sY.qHwiq9OGYD.fB.bJXDqsqYYVtmxS.rni/74YuXKcXl6', 
    'MERCHANT', 
    true,
    NOW(),
    NOW(),
    'STARTER',
    'api_key_merchant_001'
)
ON CONFLICT ("email") DO UPDATE 
SET "password" = EXCLUDED."password", 
    "role" = 'MERCHANT',
    "isActive" = true;
