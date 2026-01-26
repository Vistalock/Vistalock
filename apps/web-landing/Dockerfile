FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy all source code
COPY . .

# Install dependencies
RUN pnpm install

# Build the specific app
RUN pnpm --filter web-landing build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm

COPY --from=builder /app .

WORKDIR /app/apps/web-landing

EXPOSE 3003

CMD ["pnpm", "start", "--", "-p", "3003"]
