FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY . .

RUN pnpm install

EXPOSE 3000

RUN pnpm --filter api-gateway build

CMD ["node", "apps/api-gateway/dist/main"]
