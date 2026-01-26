INSERT INTO "User" (
    "id", 
    "email", 
    "password", 
    "role", 
    "subscriptionPlan", 
    "isActive", 
    "createdAt", 
    "updatedAt"
) VALUES (
    gen_random_uuid(), 
    'superadmin@vistalock.com', 
    '$2b$10$zAa7ozysVGMz/eviZM6Y/euuTSj1Q/M1GOMMD7lZvm3mlj4jvd1zjW', 
    'SUPER_ADMIN', 
    'STARTER', 
    true, 
    NOW(), 
    NOW()
) ON CONFLICT ("email") DO NOTHING;
