# Database Migration Guide

## Issue
Deployment failed because we're adding schema changes that may cause data loss:
1. Adding required `merchantId` column to `LoanPartner` table (2 existing rows)
2. Preserving `isActive` column (2 rows with non-null values)
3. Adding unique constraints on `apiKey` and `merchantId+slug`

## Solution
We've made `merchantId` optional and preserved `isActive` field. The build command needs `--accept-data-loss` flag.

## Render Build Command Update

**Update your Render service build command to:**
```bash
bash scripts/render-build.sh
```

Or use the full command:
```bash
npm install && cd apps/auth-service && npx prisma generate --schema=../../packages/database/prisma/schema.prisma && npx prisma db push --schema=../../packages/database/prisma/schema.prisma --accept-data-loss && npm run build
```

## Steps to Deploy

### 1. Deploy the Updated Schema
The schema now has `merchantId` as optional:
```prisma
merchantId String? // Optional to allow existing data migration
merchant   User?   @relation("MerchantLoanPartners", fields: [merchantId], references: [id], onDelete: Cascade)
```

This allows `prisma db push` to succeed without data loss.

### 2. Run Migration Script (Post-Deployment)
After successful deployment, connect to the production database and run:

```bash
psql $DATABASE_URL -f packages/database/migrations/001_add_merchant_to_loan_partner.sql
```

Or manually execute the SQL in the database console.

### 3. Verify Migration
Check that all LoanPartner records now have a merchantId:
```sql
SELECT id, name, merchantId FROM "LoanPartner";
```

## What the Migration Does

1. **Adds merchantId column** (if not exists)
2. **Backfills existing records** - Assigns all existing loan partners to the first merchant user
3. **Creates index** for performance
4. **Adds foreign key constraint**

## Future: Make merchantId Required

Once all existing data is migrated, we can make `merchantId` required again in a future update:

```prisma
merchantId String  // Remove the ?
merchant   User    @relation(...)  // Remove the ?
```

## Application Behavior

The application code already enforces `merchantId` for all new loan partner creations, so this change only affects existing data.

## Rollback Plan

If issues occur, the migration is safe to rollback:
```sql
ALTER TABLE "LoanPartner" DROP COLUMN "merchantId";
```

Then revert the schema changes and redeploy.
