# Vistalock

**Device Financing & Remote Locking Platform**

Vistalock is a specialized ERP and Device Management System designed for BNPL (Buy Now, Pay Later) businesses involved in smartphone financing. It enables merchants to:
1.  **Onboard Customers** (KYC, Phone Verification).
2.  **Issue Loans** linked to specific devices (Samsung/Android).
3.  **Remotely Lock/Unlock** devices based on payment status.
4.  **Accept Payments** via a customer portal with automated settlement (Paystack Split).

---

## 📂 Repository Structure

-   `apps/`
    -   `web-landing`: Public marketing site (Next.js).
    -   `web-dashboard`: Merchant/Admin operational dashboard (Next.js).
    -   `customer-portal`: Customer payment & status app (Next.js PWA).
    -   `api-gateway`: Unified Entrypoint (NestJS).
    -   `auth-service`: Authentication & User Management (NestJS).
    -   `device-service`: Device Registry & Locking Logic (NestJS).
    -   `loan-service`: Loan Ledger & Payment Processing (NestJS).
-   `packages/`
    -   `database`: Shared Prisma Schema & Client.
    -   `common`: Shared DTOs, Guards, and Utilities.
-   `docs/`: Detailed architectural documentation.

---

## 🚀 Quick Start (Development)

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
2.  **Start Infrastructure (Postgres)**:
    ```bash
    docker-compose up -d postgres
    ```
3.  **Start Development Server**:
    ```bash
    pnpm dev
    ```

## 🌍 Deployment

For production deployment instructions, please read **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## 🔐 Credentials & Handoff

For system credentials, ports, and administrative handoff details, please see **[HANDOFF.md](./HANDOFF.md)**.
