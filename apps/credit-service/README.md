# Credit Service

Vistalock Credit Engine Microservice - Handles all credit decisioning, identity verification, and fraud detection.

## Overview

The Credit Service is a dedicated microservice that follows the CredLock architecture model:
- **Server-side only** - No credit logic in mobile apps
- **Centralized decisions** - Single source of truth
- **Admin-configurable** - Rules can be updated without code changes
- **Fraud prevention** - Multi-layer fraud detection
- **Audit trail** - Full compliance logging

## Architecture

```
Agent App → API Gateway → Credit Service → Dojah API
                              ↓
                        Decision Engine
                              ↓
                    APPROVED / LIMITED / REJECTED
```

## Features

### 1. Identity Verification
- NIN verification via Dojah
- BVN verification (optional)
- Phone number validation
- Fuzzy name matching

### 2. Fraud Detection
- Blacklist checking
- Multiple BVN detection
- Velocity checks (rapid attempts)
- Default history
- Cross-merchant fraud detection

### 3. Credit Scoring
- 5-factor scoring model
- Configurable weights
- Score range: 0-1000
- Decision matrix based on score

### 4. Merchant Policies
- Per-merchant risk rules
- Max device value limits
- Allowed tenure options
- Down payment requirements

## API Endpoints

### POST /credit/eligibility-check

Check customer eligibility for BNPL loan.

**Request:**
```json
{
  "merchantId": "MER123",
  "agentId": "AGT456",
  "customer": {
    "fullName": "John Doe",
    "phoneNumber": "08012345678",
    "nin": "12345678901",
    "bvn": "22123456789",
    "dateOfBirth": "1995-03-12"
  },
  "requestedProduct": {
    "productId": "PROD789",
    "category": "ANDROID_PHONE",
    "price": 180000
  }
}
```

**Response (Approved):**
```json
{
  "status": "APPROVED",
  "decision": {
    "approved": true,
    "maxDeviceValue": 500000,
    "allowedTenure": [3, 6, 9, 12],
    "minDownPayment": 36000,
    "interestRate": 0.025,
    "creditRating": "GOOD"
  },
  "checkId": "CHK_1234567890"
}
```

**Response (Rejected):**
```json
{
  "status": "REJECTED",
  "decision": {
    "approved": false,
    "reasonCode": "INSUFFICIENT_CREDIT_PROFILE",
    "message": "Customer does not meet minimum requirements"
  },
  "checkId": "CHK_1234567891"
}
```

## Decision Matrix

| Score Range | Decision | Max Loan | Down Payment | Tenure | Interest Rate |
|-------------|----------|----------|--------------|--------|---------------|
| 750-1000 | APPROVED | ₦1,000,000 | 20% | 3-12 months | 2.5%/month |
| 650-749 | APPROVED | ₦500,000 | 25% | 3-9 months | 3.0%/month |
| 500-649 | APPROVED_WITH_LIMITS | ₦250,000 | 35% | 3-6 months | 3.5%/month |
| 0-499 | REJECTED | N/A | N/A | N/A | N/A |

## Scoring Factors

1. **Identity Confidence (30%)**
   - NIN verified
   - BVN verified
   - Name match
   - Phone match

2. **Phone Stability (15%)**
   - Phone age in months
   - Consistent usage

3. **BNPL History (25%)**
   - Previous loans
   - Default rate
   - On-time payment rate

4. **Device Price Ratio (15%)**
   - Device price vs estimated income
   - Affordability check

5. **Merchant Risk Profile (15%)**
   - Merchant default rate
   - Merchant volume

## Environment Variables

```bash
# Server
PORT=3004
NODE_ENV=development

# Dojah API
DOJAH_APP_ID=your_dojah_app_id
DOJAH_API_KEY=your_dojah_api_key

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vistalock
```

## Installation

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Run in production
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security

- ✅ All Dojah API calls are server-side
- ✅ API keys never exposed to clients
- ✅ JWT authentication required
- ✅ Rate limiting enabled
- ✅ Full audit logging
- ✅ NDPR compliant

## Compliance

- ✅ Customer consent required
- ✅ Data minimization
- ✅ Right to be forgotten
- ✅ Audit trail for all decisions
- ✅ 7-year data retention

## Monitoring

- Logs all credit decisions
- Tracks fraud detection
- Monitors API performance
- Alerts on anomalies

## Support

For issues or questions, contact the Vistalock development team.
