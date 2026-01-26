# VistaLock System Architecture

## 1. High-Level Overview
VistaLock is a microservices-based distributed system designed to manage BNPL (Buy Now Pay Later) device financing and enforcement.

## 2. Core Microservices

### 2.1 Auth Service (`auth-service`)
- **Responsibility**: User authentication and authorization.
- **Roles**: Admin, Merchant, Customer.
- **Tech**: NestJS, Passport (JWT), PostgreSQL (Users Table).
- **Key Features**:
    - Sign up/Login (Email/Password, potentially Phone/OTP).
    - Role-Based Access Control (RBAC).

### 2.2 Device Service (`device-service`)
- **Responsibility**: Registry of physical devices and their lock states.
- **Tech**: NestJS, PostgreSQL (Devices Table).
- **Key Features**:
    - Register Device (IMEI, Serial).
    - Update Lock Status (Locked/Unlocked).
    - Polling Endpoint for Android Agent (Heartbeat).
    - Command Queue (for asynchronous lock commands).

### 2.3 Loan Service (`loan-service`)
- **Responsibility**: Management of loans, generic repayment schedules, and credit scoring.
- **Tech**: NestJS, PostgreSQL (Loans, Installments Tables).
- **Key Features**:
    - Loan Application & Approval.
    - Installment Schedule Generation.
    - Payment Tracking (integration with Payment Gateway).
    - Overdue Calculator (triggers Lock events).

### 2.4 Notification Service (`notification-service`)
- **Responsibility**: Sending SMS/Email alerts.
- **Tech**: NestJS, Queue (Redis/Bull).

### 2.5 API Gateway (`api-gateway`)
- **Responsibility**: Entry point for all client requests (Mobile App, Web Dashboard).
- **Tech**: NestJS (or Nginx/Kong in prod).
- **Features**: Rate limiting, proxying to microservices, SSL termination.

## 3. Communication Patterns
- **Synchronous**: REST/gRPC for direct data retrieval (e.g., Dashboard requesting User details).
- **Asynchronous**: Message Broker (Redis/RabbitMQ) for event-driven actions (e.g., "Payment Received" event -> triggers "Unlock Device" command).

## 4. Android Device Agent (Architecture)
- **Mode**: Device Owner (DPC - Device Policy Controller).
- **Key Capabilities**:
    - `lockTaskMode`: Pinning the Kiosk app.
    - `setApplicationHidden`: Hiding settings/play store.
    - `addUserRestriction`: Preventing factory reset, safe mode, ADB.
- **Offline Logic**: Caches last known state. Re-syncs on connectivity.

## 5. Security Architecture
- **Transport**: TLS 1.2+ for all communications.
- **Device Auth**: Signed tokens generated during enrollment.
- **Anti-Tamper**: Root detection checks reported in Heartbeat.
