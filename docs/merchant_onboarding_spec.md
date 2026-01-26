# Merchant Registration, Verification & Activation (Spec)

## 1. Registration Model
VistaLock uses a controlled merchant onboarding model to protect lenders, merchants, customers, and OEM partners.

**Registration paths:**
*   **Assisted registration (default):** VistaLock sales/admin initiates the merchant account
*   **Controlled self-registration:** Merchant applies via portal → status = `Pending Approval`

*No merchant can onboard customers or provision devices until approved.*

## 2. Required Merchant Registration Details

### A. Business Information
*   Legal business name
*   Business registration number (CAC / RC)
*   Business type (sole prop, limited, enterprise)
*   Date of incorporation
*   Registered business address
*   Operating address(es)

### B. Owner / Director KYC
*   Full legal name
*   Phone number
*   Email address
*   Government-issued ID (NIN / Passport / Driver’s License)
*   Role (Owner / Director)

### C. Operational Details
*   Device categories sold (Android phones default)
*   Estimated monthly device volume
*   Average device price range
*   Number of physical locations
*   Expected number of merchant agents

### D. Financial & Settlement Information
*   Bank name
*   Account number
*   Account holder name
*   Settlement frequency
*   Revenue share / commission agreement

### E. Legal & Compliance
*   Signed Merchant Agreement
*   Acceptance of:
    *   Device control policy
    *   Customer consent obligations
    *   NDPR / GDPR data handling
    *   AML & fraud declaration

## 3. Merchant Verification Flow
1.  Registration submission
2.  KYC / KYB verification
3.  Risk assessment
4.  **Decision:**
    *   Approved
    *   Conditionally Approved
    *   Rejected

## 4. Merchant Activation
Once approved:
*   Merchant ID is created
*   Merchant Admin account issued
*   Initial package & device limits assigned
*   **Merchant can now:**
    *   Create agents
    *   Upload inventory
    *   Begin BNPL onboarding

## 5. Merchant Packages & Limits
*   Starter / Growth / Enterprise tiers
*   **Android phones enabled by default**
*   POS, tablets, IoT → enabled only by request + payment

## 6. Ongoing Monitoring & Enforcement
VistaLock may:
*   Suspend onboarding
*   Reduce device limits
*   Freeze merchant account
based on fraud, default rates, or policy violations.
