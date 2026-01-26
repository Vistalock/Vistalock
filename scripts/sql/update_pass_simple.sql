UPDATE "User" SET password=(SELECT password FROM "User" WHERE email='superadmin_simple@vistalock.com'), role='SUPER_ADMIN' WHERE email='superadmin@vistalock.com';
