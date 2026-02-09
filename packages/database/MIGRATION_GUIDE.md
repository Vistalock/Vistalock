# Database Migration Guide

## Issue
Deployment failed because we're adding a required `merchantId` column to the `LoanPartner` table which already has 2 rows of data in production.

## Solution
We've made `merchantId` optional in the schema to allow the deployment to succeed. After deployment, run the migration script to backfill existing data.

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
