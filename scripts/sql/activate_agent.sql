-- Activate Andy White's agent account with password
UPDATE "User" 
SET password = '$2b$10$rLKzdikYoDBPaW7tx7lYtuSXIyrj.Pa83ggajxJDGqTiyzdMwtCaWa',
    "isActive" = true
WHERE email = 'andywhite@vistalock.com';

-- Update agent profile status to ACTIVE
UPDATE "AgentProfile"
SET status = 'ACTIVE'
WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'andywhite@vistalock.com');
