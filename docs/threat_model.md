# VistaLock Threat Model

## Overview
This document outlines potential security threats to the VistaLock platform and the mitigation strategies implemented.

## STRIDE Analysis

### 1. Spoofing
-   **Threat**: Malicious actor impersonates a legitimate device (Device Spoofing).
    -   **Mitigation**: Enforce unique IMEI checks. (Future: mTLS or generated Secrets per device).
-   **Threat**: User impersonation.
    -   **Mitigation**: JWT Authentication with strong secrets.

### 2. Tampering
-   **Threat**: Database modification.
    -   **Mitigation**: Restricted database access; ORM abstraction (Prisma).
-   **Threat**: Payload modification in transit.
    -   **Mitigation**: Enforce HTTPS (TLS) everywhere (Infrastructure level).

### 3. Repudiation
-   **Threat**: Admin denies unlocking a device.
    -   **Mitigation**: Audit Logs for all critical actions (lock/unlock, loan creation).

### 4. Information Disclosure
-   **Threat**: Leaking PII (User emails, Loan details).
    -   **Mitigation**:
        -   Role-Based Access Control (RBAC).
        -   Strip sensitive fields (passwordHash) from responses.
        -   Error handling masking internal server details.

### 5. Denial of Service (DoS)
-   **Threat**: API flood to crash services.
    -   **Mitigation**: Rate Limiting (`@nestjs/throttler`).

### 6. Elevation of Privilege
-   **Threat**: Customer acting as Merchant/Admin.
    -   **Mitigation**: Strict `RolesGuard` on all endpoints.

## Layered Security Architecture

1.  **WAF / Gateway**: (Planned) Filters malicious traffic.
2.  **Application Layer**:
    -   Input Validation (`class-validator`).
    -   Rate Limiting (`ThrottlerGuard`).
    -   Secure Headers (`helmet`).
3.  **Data Layer**:
    -   Encrypted connections.
    -   Least privilege database users.
