# Vistalock Safe Deployment & Staging Guide

To ensure that new features (like the Agent Commission Engine) and updates can be safely tested without affecting live production data or databases, you need a **Staging Environment**. 

A Staging environment is an exact replica of your Production environment, but strictly isolated.

## 1. What is a Staging Environment?
*   **Production (Live)**: Where real customers, agents, and merchants interact. Uses the live database (`PROD_DATABASE_URL`).
*   **Staging (Testing)**: A sandbox environment that looks and acts exactly like Production. Uses a separate test database (`STAGING_DATABASE_URL`). 
*   **Local (Development)**: Your local machine where code is actively written and initially tested. Uses a local database.

## 2. Setting Up the Isolated Databases
Currently, Vistalock uses Prisma connected to a database. 
You must **never** connect your Local or Staging code to the Production database.

**To set up safe testing:**
1.  Go to your database provider (e.g., Supabase, Vercel Postgres, AWS RDS, Neon).
2.  Create a completely new, empty database instance and name it `vistalock-staging`.
3.  Copy the connection string for this new database.

## 3. Environment Variables Strategy
Your code relies on `.env` files to know which database and APIs to talk to.

**Local Development (`.env.local`)**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/vistalock_local"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Staging on Vercel/Railway (`.env.preview` / Staging Vars)**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/vistalock-staging"
NEXT_PUBLIC_API_URL="https://staging-api.vistalock.com"
```

**Production on Vercel/Railway (`.env.production` / Live Vars)**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/vistalock-live-prod"
NEXT_PUBLIC_API_URL="https://api.vistalock.com"
```

## 4. The Safe Deployment Workflow

Instead of pushing directly to production, follow this workflow:

### Step 1: Branching
Never write new features directly on the `main` or `master` branch.
*   Create a feature branch: `git checkout -b feature/agent-commissions`
*   Write and test the code locally.

### Step 2: Push to Staging
*   When the local test is working, commit the changes.
*   Push to a dedicated staging branch: `git checkout staging && git merge feature/agent-commissions && git push origin staging`
*   **Vercel / Hosting Setup**: Configure Vercel to automatically deploy anytime a push happens to the `staging` branch. This creates a URL (e.g., `staging.vistalock.com`).

### Step 3: Migrating the Staging Database
Because Staging has its own database, you must apply any schema changes to it:
*   `npx prisma migrate deploy` (Targeted at the Staging Database URL)

### Step 4: QA / User Acceptance Testing
*   Open the staging URL (`staging.vistalock.com`).
*   Test the feature thoroughly. Create mock agents, mock loans, and see if the commissions calculate correctly. **Since this is the staging database, you can safely create, delete, and modify data without breaking live customer records.**

### Step 5: Push to Live Production
Only when the feature is 100% verified on Staging do you push to Production.
*   Merge into main: `git checkout main && git merge staging && git push origin main`
*   Deploy the production database schema: `npx prisma migrate deploy` (Targeted at Production Database URL)

## 5. Integrating with 3rd Party APIs (Paystack / Dojah)
*   **Staging**: Always use the "Test API Keys" provided by Paystack and Dojah (e.g., keys starting with `sk_test_...` and `pk_test_...`).
*   **Production**: Only use the "Live API Keys" (`sk_live_...`).

## Summary
By separating the **Database URL** and **Branch routing**, you create a perfect sandbox. You can confidently break things, test new schema updates, and verify financial calculations on Staging before moving the exact same, proven code to the Live Production server.
