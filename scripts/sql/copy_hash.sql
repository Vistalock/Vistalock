UPDATE "User" 
SET "password" = (SELECT "password" FROM "User" WHERE "email" = 'test@vistalock.com')
WHERE "email" = 'superadmin@vistalock.com';
