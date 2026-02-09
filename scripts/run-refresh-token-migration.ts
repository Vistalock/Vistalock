import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://vistalock_db_user:ss8KGJe1RFtxkPuBWAhfqiDABAiT2rob@dpg-d5rtjjh4tr6s738ej6l0-a.virginia-postgres.render.com/vistalock_db";

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL }
    }
});

async function runMigration() {
    try {
        console.log('🔄 Running RefreshToken migration on production database...\n');

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "RefreshToken" (
                "id" TEXT NOT NULL,
                "token" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "revoked" BOOLEAN NOT NULL DEFAULT false,
                CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Created RefreshToken table');

        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
        `);
        console.log('✅ Created unique index on token');

        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
        `);
        console.log('✅ Created index on userId');

        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");
        `);
        console.log('✅ Created index on token (duplicate for query optimization)');

        // Check if foreign key already exists before adding
        const fkExists = await prisma.$queryRawUnsafe(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'RefreshToken_userId_fkey'
            AND table_name = 'RefreshToken';
        `);

        if (!Array.isArray(fkExists) || fkExists.length === 0) {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "RefreshToken" 
                ADD CONSTRAINT "RefreshToken_userId_fkey" 
                FOREIGN KEY ("userId") REFERENCES "User"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            console.log('✅ Added foreign key constraint');
        } else {
            console.log('ℹ️  Foreign key constraint already exists');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
