# VistaLock E2E Testing Setup Script (PowerShell)
# This script prepares the environment for end-to-end testing

$ErrorActionPreference = "Stop"

Write-Host "🚀 VistaLock E2E Testing Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Check Prerequisites
Write-Host "`nStep 1: Checking Prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Step 2: Install Dependencies
Write-Host "`nStep 2: Installing Dependencies..." -ForegroundColor Yellow

Write-Host "Installing root dependencies..."
npm install

Write-Host "Installing database package dependencies..."
Set-Location packages\database
npm install
Set-Location ..\..

Write-Host "Installing auth-service dependencies..."
Set-Location apps\auth-service
npm install
Set-Location ..\..

Write-Host "Installing web-dashboard dependencies..."
Set-Location apps\web-dashboard
npm install
Set-Location ..\..

Write-Host "Installing merchant-agent dependencies..."
Set-Location apps\merchant-agent
npm install
Set-Location ..\..

Write-Host "✅ All dependencies installed" -ForegroundColor Green

# Step 3: Generate Prisma Client
Write-Host "`nStep 3: Generating Prisma Client..." -ForegroundColor Yellow
Set-Location packages\database
npx prisma generate
Set-Location ..\..
Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Step 4: Setup Environment Files
Write-Host "`nStep 4: Setting up Environment Files..." -ForegroundColor Yellow

# Auth Service .env
if (-not (Test-Path "apps\auth-service\.env")) {
    Write-Host "Creating auth-service\.env from example..."
    Copy-Item "apps\auth-service\.env.example" "apps\auth-service\.env"
    Write-Host "✅ Created apps\auth-service\.env" -ForegroundColor Green
}
else {
    Write-Host "⚠️  apps\auth-service\.env already exists" -ForegroundColor Yellow
}

# Web Dashboard .env.local
if (-not (Test-Path "apps\web-dashboard\.env.local")) {
    Write-Host "Creating web-dashboard\.env.local..."
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath "apps\web-dashboard\.env.local" -Encoding utf8
    Write-Host "✅ Created apps\web-dashboard\.env.local" -ForegroundColor Green
}
else {
    Write-Host "⚠️  apps\web-dashboard\.env.local already exists" -ForegroundColor Yellow
}

# Step 5: Create Upload Directory
Write-Host "`nStep 5: Creating Upload Directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "apps\auth-service\uploads\kyc" | Out-Null
Write-Host "✅ Upload directory created" -ForegroundColor Green

# Step 6: Database Setup
Write-Host "`nStep 6: Database Setup..." -ForegroundColor Yellow
Write-Host "Attempting to push database schema..."
Set-Location packages\database

try {
    npx prisma db push --skip-generate
    Write-Host "✅ Database schema pushed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Database push failed. Please ensure PostgreSQL is running." -ForegroundColor Red
    Write-Host "Connection string: postgresql://user:secret123@localhost:5433/vistalock_local"
    Set-Location ..\..
    exit 1
}

Set-Location ..\..

# Step 7: Create Test Data Script
Write-Host "`nStep 7: Creating Test Data Script..." -ForegroundColor Yellow

$testDataScript = @"
import { PrismaClient } from '@vistalock/database';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test merchants...');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('Test123!', salt);

  // Merchant A
  const merchantA = await prisma.user.upsert({
    where: { email: 'merchant-a@test.com' },
    update: {},
    create: {
      email: 'merchant-a@test.com',
      password: password,
      role: 'MERCHANT',
      merchantProfile: {
        create: {
          businessName: 'Tech Store A',
          businessAddress: '123 Tech Street, Lagos',
          contactPerson: 'John Merchant',
          phoneNumber: '+2348011111111',
          maxDevices: 100,
          maxAgents: 10,
        },
      },
    },
  });

  // Merchant B
  const merchantB = await prisma.user.upsert({
    where: { email: 'merchant-b@test.com' },
    update: {},
    create: {
      email: 'merchant-b@test.com',
      password: password,
      role: 'MERCHANT',
      merchantProfile: {
        create: {
          businessName: 'Electronics Hub B',
          businessAddress: '456 Electronics Ave, Abuja',
          contactPerson: 'Jane Merchant',
          phoneNumber: '+2348022222222',
          maxDevices: 100,
          maxAgents: 10,
        },
      },
    },
  });

  console.log('✅ Test merchants created:');
  console.log('   Merchant A:', merchantA.email);
  console.log('   Merchant B:', merchantB.email);
  console.log('   Password: Test123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.`$disconnect();
  });
"@

$testDataScript | Out-File -FilePath "scripts\create-test-merchants.ts" -Encoding utf8
Write-Host "✅ Test data script created" -ForegroundColor Green

# Step 8: Summary
Write-Host "`n================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Start PostgreSQL (if not running)"
Write-Host "2. Run test data script:"
Write-Host "   npx ts-node scripts\create-test-merchants.ts" -ForegroundColor Green
Write-Host ""
Write-Host "3. Start services in separate terminals:"
Write-Host "   Terminal 1: cd apps\auth-service; npm run start:dev" -ForegroundColor Green
Write-Host "   Terminal 2: cd apps\web-dashboard; npm run dev" -ForegroundColor Green
Write-Host "   Terminal 3: cd apps\merchant-agent; npx expo start" -ForegroundColor Green
Write-Host ""
Write-Host "4. Follow the E2E Testing Guide in the artifacts directory"
Write-Host ""
Write-Host "Happy Testing! 🎉" -ForegroundColor Yellow
