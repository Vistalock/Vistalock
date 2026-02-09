-- Migration: Add merchantId to LoanPartner table
-- This migration handles existing data by making merchantId optional first

-- Step 1: Add merchantId column as optional
ALTER TABLE "LoanPartner" ADD COLUMN IF NOT EXISTS "merchantId" TEXT;

-- Step 2: Backfill existing LoanPartner records with a default merchant
-- Find the first merchant user and assign all existing loan partners to them
DO $$
DECLARE
    default_merchant_id TEXT;
BEGIN
    -- Get the first merchant user
    SELECT id INTO default_merchant_id
    FROM "User"
    WHERE role = 'MERCHANT'
    LIMIT 1;

    -- If no merchant exists, create a placeholder (should not happen in production)
    IF default_merchant_id IS NULL THEN
        RAISE NOTICE 'No merchant found. Existing loan partners will remain unassigned.';
    ELSE
        -- Update all existing loan partners to belong to this merchant
        UPDATE "LoanPartner"
        SET "merchantId" = default_merchant_id
        WHERE "merchantId" IS NULL;
        
        RAISE NOTICE 'Assigned % existing loan partners to merchant %', 
            (SELECT COUNT(*) FROM "LoanPartner" WHERE "merchantId" = default_merchant_id),
            default_merchant_id;
    END IF;
END $$;

-- Step 3: After backfilling, we can make merchantId required in a future migration
-- For now, leave it optional to allow the deployment to succeed
-- The application code will enforce merchantId requirement for new records

-- Add index for performance
CREATE INDEX IF NOT EXISTS "LoanPartner_merchantId_idx" ON "LoanPartner"("merchantId");

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'LoanPartner_merchantId_fkey'
    ) THEN
        ALTER TABLE "LoanPartner"
        ADD CONSTRAINT "LoanPartner_merchantId_fkey"
        FOREIGN KEY ("merchantId")
        REFERENCES "User"("id")
        ON DELETE CASCADE;
    END IF;
END $$;
