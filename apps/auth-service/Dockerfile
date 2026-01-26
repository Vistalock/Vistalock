FROM node:20

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/device-service/package.json ./apps/device-service/package.json
COPY apps/loan-service/package.json ./apps/loan-service/package.json
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY apps/web-dashboard/package.json ./apps/web-dashboard/package.json
COPY apps/web-landing/package.json ./apps/web-landing/package.json
COPY packages/database/package.json ./packages/database/package.json

# Copy source code
COPY . .

# Install dependencies (including workspace links)
RUN pnpm install

# Generate Prisma Client (crucial for services to work)
RUN pnpm --filter @vistalock/database exec prisma generate

# Expose port
EXPOSE 3001


# Build the application
RUN pnpm --filter auth-service build

# Run production build
CMD ["node", "apps/auth-service/dist/main"]
