# System Handoff Document

**Date**: December 22, 2025
**Project**: Vistalock
**Version**: 1.0.0 (MVP)

---

## 1. System Access (Default Credentials)

**⚠️ MMPORTANT**: Change these immediately upon deployment!

### Database (PostgreSQL)
-   **User**: `user`
-   **Password**: `secret123`
-   **Database**: `vistalock_prod`
-   **Internal Port**: `5432`

### Admin User (Created via Seed)
-   **Email**: `admin@vistalock.com`
-   **Password**: `Admin123!`
-   **Role**: `SUPER_ADMIN`

### Merchant User (Demo)
-   **Email**: `merchant@store.com`
-   **Password**: `Merchant123!`

---

## 2. Service Registry (Production Ports)

| Service | Host Port | Internal Port | URL |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `3000` | `3000` | `http://localhost:3000` |
| **Landing Page** | `3003` | `3003` | `http://localhost:3003` |
| **Merchant Dashboard** | `3004` | `3004` | `http://localhost:3004` |
| **Customer Portal** | `3005` | `3005` | `http://localhost:3005` |

---

## 3. Key Operational Workflows

### A. Deploying Updates
Build and restart containers without downtime (using rolling updates if swarm, or brief interruption if compose):
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### B. Database Migrations
When `packages/database/prisma/schema.prisma` is modified, you must apply changes to the production DB:
```bash
docker-compose -f docker-compose.prod.yml exec auth-service npx prisma db push
```

### C. Viewing Logs
To debug a specific service (e.g., locking issues):
```bash
docker-compose -f docker-compose.prod.yml logs -f device-service
```

---

## 4. Known Envrionment Variables
Defined in `docker-compose.prod.yml` (and `.env` if created):

-   `JWT_SECRET`: Used for signing Auth Tokens.
-   `DATABASE_URL`: Connection string for Postgres.
-   `NEXT_PUBLIC_API_URL`: Frontend config pointing to Gateway.

---

## 5. Future Roadmap (Phase 14+)
-   **Payment Gateway**: Switch from Mock to `Paystack` / `Flutterwave` SDKs in `TransactionService`.
-   **Android App**: Build the Native Android Agent using the `enrollmentToken` logic defined in Phase 12.
-   **Kubernetes**: Migrate from Docker Compose to K8s for high availability.
