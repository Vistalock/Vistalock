#!/bin/bash

# VistaLock E2E Testing Setup Script
# This script prepares the environment for end-to-end testing

set -e  # Exit on error

echo "🚀 VistaLock E2E Testing Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo -e "\n${YELLOW}Step 1: Checking Prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found (optional)${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL client found${NC}"
fi

# Step 2: Install Dependencies
echo -e "\n${YELLOW}Step 2: Installing Dependencies...${NC}"

echo "Installing root dependencies..."
npm install

echo "Installing database package dependencies..."
cd packages/database
npm install
cd ../..

echo "Installing auth-service dependencies..."
cd apps/auth-service
npm install
cd ../..

echo "Installing web-dashboard dependencies..."
cd apps/web-dashboard
npm install
cd ../..

echo "Installing merchant-agent dependencies..."
cd apps/merchant-agent
npm install
cd ../..

echo -e "${GREEN}✅ All dependencies installed${NC}"

# Step 3: Generate Prisma Client
echo -e "\n${YELLOW}Step 3: Generating Prisma Client...${NC}"
cd packages/database
npx prisma generate
cd ../..
echo -e "${GREEN}✅ Prisma client generated${NC}"

# Step 4: Setup Environment Files
echo -e "\n${YELLOW}Step 4: Setting up Environment Files...${NC}"

# Auth Service .env
if [ ! -f "apps/auth-service/.env" ]; then
    echo "Creating auth-service/.env from example..."
    cp apps/auth-service/.env.example apps/auth-service/.env
    echo -e "${GREEN}✅ Created apps/auth-service/.env${NC}"
else
    echo -e "${YELLOW}⚠️  apps/auth-service/.env already exists${NC}"
fi

# Web Dashboard .env.local
if [ ! -f "apps/web-dashboard/.env.local" ]; then
    echo "Creating web-dashboard/.env.local..."
    cat > apps/web-dashboard/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo -e "${GREEN}✅ Created apps/web-dashboard/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  apps/web-dashboard/.env.local already exists${NC}"
fi

# Step 5: Create Upload Directory
echo -e "\n${YELLOW}Step 5: Creating Upload Directory...${NC}"
mkdir -p apps/auth-service/uploads/kyc
echo -e "${GREEN}✅ Upload directory created${NC}"

# Step 6: Database Setup
echo -e "\n${YELLOW}Step 6: Database Setup...${NC}"
echo "Attempting to push database schema..."
cd packages/database

if npx prisma db push --skip-generate; then
    echo -e "${GREEN}✅ Database schema pushed successfully${NC}"
else
    echo -e "${RED}❌ Database push failed. Please ensure PostgreSQL is running.${NC}"
    echo "Connection string: postgresql://user:secret123@localhost:5433/vistalock_local"
    exit 1
fi

cd ../..

# Step 7: Create Test Data Script
echo -e "\n${YELLOW}Step 7: Creating Test Data Script...${NC}"

cat > scripts/create-test-merchants.ts << 'EOF'
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
    await prisma.$disconnect();
  });
EOF

echo -e "${GREEN}✅ Test data script created${NC}"

# Step 8: Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Start PostgreSQL (if not running)"
echo "2. Run test data script:"
echo "   ${GREEN}npx ts-node scripts/create-test-merchants.ts${NC}"
echo ""
echo "3. Start services in separate terminals:"
echo "   Terminal 1: ${GREEN}cd apps/auth-service && npm run start:dev${NC}"
echo "   Terminal 2: ${GREEN}cd apps/web-dashboard && npm run dev${NC}"
echo "   Terminal 3: ${GREEN}cd apps/merchant-agent && npx expo start${NC}"
echo ""
echo "4. Follow the E2E Testing Guide:"
echo "   ${GREEN}cat .gemini/antigravity/brain/*/e2e-testing-guide.md${NC}"
echo ""
echo -e "${YELLOW}Happy Testing! 🎉${NC}"
