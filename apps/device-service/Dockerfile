FROM node:20

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app
RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm --filter @vistalock/database exec prisma generate

EXPOSE 3002


# Build the application
RUN pnpm --filter device-service build

# Run production build
CMD ["node", "apps/device-service/dist/main"]
