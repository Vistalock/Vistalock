#!/bin/bash
# Build script for Render deployment
# This script handles database migrations and builds the auth-service

set -e  # Exit on error

echo "==> Installing dependencies..."
npm install

echo "==> Navigating to auth-service..."
cd apps/auth-service

echo "==> Generating Prisma Client..."
npx prisma generate --schema=../../packages/database/prisma/schema.prisma

echo "==> Pushing database schema (accepting data loss for migrations)..."
npx prisma db push --schema=../../packages/database/prisma/schema.prisma --accept-data-loss

echo "==> Building auth-service..."
npm run build

echo "==> Build completed successfully!"
