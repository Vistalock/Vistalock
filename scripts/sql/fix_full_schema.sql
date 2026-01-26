
-- 1. Enums
DO $$ BEGIN
    CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'DEACTIVATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. User columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "merchantId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "apiKey" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER';

-- 3. Constraints for User
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. AgentProfile Table
CREATE TABLE IF NOT EXISTS "AgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "onboardingLimit" INTEGER NOT NULL DEFAULT 0,
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- 5. AgentProfile Constraints
DO $$ BEGIN
    CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
