# VistaLock Product Requirements Document (PRD)

## 1. Executive Summary
VistaLock enables merchants to sell Android smartphones on installment plans with reduced risk by enforcing payment compliance through remote device locking.

## 2. Modules & Features

### 2.1 Merchant Dashboard (Web)
- **Overview**: React-based dashboard for merchants to manage their inventory and customers. Serves as the primary point of sale for initiating loans.
- **Features**:
    - **Dashboard**: High-level metrics (Active Loans, Defaulters, Revenue).
    - **Device Inventory**: Add/Edit devices (IMEI scanning).
    - **Customer Management**: KYC data input, Loan assignment.
    - **Credit Initiation (FoneFlex equivalent)**: Merchant initiates the loan application on behalf of the customer at the point of sale.
    - **Manual Controls**: Override Lock/Unlock buttons.

### 2.2 Customer App (Android/Web - Optional Phase 2)
- View payment history.
- Make manual payments (Card, Transfer, USSD).
- **Micro-credit (FoneFlex)**: Request cash loans using the existing device as collateral (after building repayment history).

### 2.3 Android Enforcement Agent (Device Deterrence)
- **Core Function**: "Device as Collateral" enforcement.
- **Kiosk Screen**: Shows "Device Locked" message, Amount Due, Merchant Contact.
- **Functionality Restriction**: Restricts access to apps and settings while ensuring the device remains partially active for location tracking and emergency calls.
- **Service Worker**: Runs in background, pings server every X minutes.
- **Boot Receiver**: Starts agent immediately on boot.

## 3. Data Flow Example: Default Scenario
1. **Trigger**: Loan Service detects `dueDate` passed with `status: UNPAID`.
2. **Event**: Emits `LOAN_DEFAULT` event.
3. **Consumer**: Device Service listens to `LOAN_DEFAULT`.
4. **Action**: Findings associated Device ID. Updates DB state to `LOCKED`.
5. **Command**: Queues `LOCK` command for Android Agent.
6. **Execution**: Android Agent polls (or receives push), sees `LOCK` command -> Engages Kiosk Mode.

## 4. Roadmap
- **Phase 1 (MVP)**:
    - Manual Merchant Dashboard.
    - Basic Auth.
    - Device Registry.
    - Manual Lock/Unlock API.
    - Simulated Android Client.
- **Phase 2**:
    - Automated Loan Logic.
    - Real Android DPC implementation.
