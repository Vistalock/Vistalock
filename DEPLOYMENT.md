# Vistalock Deployment Guide

This guide details how to deploy the Vistalock ecosystem to a production environment (Linux VPS, AWS EC2, DigitalOcean Droplet, etc.) using Docker Compose.

## 1. Prerequisites
-   **OS**: Ubuntu 22.04 LTS (Recommended) or any Docker-compatible Linux.
-   **Hardware**: Min 4GB RAM, 2 vCPU (Node.js services are memory hungry).
-   **Software**:
    -   Docker Engine (v24+)
    -   Docker Compose (v2+)

## 2. Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-org/vistalock.git
    cd vistalock
    ```

2.  **Environment Configuration**:
    -   The `docker-compose.prod.yml` uses default values for simplicity.
    -   **SECURITY WARNING**: Change `POSTGRES_PASSWORD` and `JWT_SECRET` in a real environment!
    -   You can create a `.env` file and reference it in the compose file if needed.

## 3. Deployment
Run the production stack in detached mode:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
*Note: This may take 5-10 minutes on the first run to build all images.*

## 4. Initialization (First Run Only)
The production database (`vistalock_prod`) starts empty. You must push the schema.

1.  **Wait** for services to start (check logs).
2.  **Push Schema**:
    ```bash
    docker-compose -f docker-compose.prod.yml exec auth-service npx prisma db push
    ```
3.  **Seed Data** (Optional - creates Admin User):
    ```bash
    docker-compose -f docker-compose.prod.yml exec auth-service npx ts-node prisma/seed.ts
    ```

## 5. Access
| Service | URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | `http://<your-ip>:3003` | Public Marketing Site |
| **Dashboard** | `http://<your-ip>:3004` | Merchant/Admin Dashboard |
| **Customer Portal** | `http://<your-ip>:3005` | Customer Payment PWA |
| **API Gateway** | `http://<your-ip>:3000` | Backend API Entrypoint |

## 6. Maintenance
-   **View Logs**:
    ```bash
    docker-compose -f docker-compose.prod.yml logs -f
    ```
-   **Update Application**:
    ```bash
    git pull
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
-   **Stop Services**:
    ```bash
    docker-compose -f docker-compose.prod.yml down
    ```
