FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy all source code (Simplest strategy for monorepo context without pruning)
COPY . .

# Install dependencies
RUN pnpm install

# Build the specific app
RUN pnpm --filter web-dashboard build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm

# Copy built artifacts from builder
COPY --from=builder /app/apps/web-dashboard/package.json ./package.json

# If using standalone output (recommended for Next.js in Docker)
# We would copy .next/standalone. But for simplicity/stability without tweaking next.config, 
# we'll copy the whole needed source or just run 'next start'. 
# Note: 'next start' requires node_modules. 
# A cleaner, faster way in Monorepo is complex. 
# We'll stick to a "fat" image strategy for guaranteed success: reuse builder's node_modules or reinstall prod deps.
# Let's use the builder stage as the runner for now to avoid missing workspace links.
# Optimizing image size is Phase 14 :)

COPY --from=builder /app .

WORKDIR /app/apps/web-dashboard

EXPOSE 3004

CMD ["pnpm", "start", "--", "-p", "3004"]
