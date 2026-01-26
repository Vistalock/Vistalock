UPDATE "User" SET password=(SELECT password FROM "User" WHERE email='superadmin_final@vistalock.com'), role='SUPER_ADMIN' WHERE email='superadmin@vistalock.com';
