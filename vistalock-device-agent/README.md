# Vistalock Device Agent

A React Native mobile application that runs on customer devices to enforce payment compliance for BNPL (Buy Now Pay Later) loans.

## Overview

The Vistalock Device Agent is installed on customer devices during the onboarding process. It monitors payment status and automatically locks the device if payments are missed, ensuring loan compliance.

## Features

- **Device Registration**: Activate device with activation code and IMEI
- **Automatic Lock/Unlock**: Device locks on missed payment, unlocks on payment confirmation
- **Payment Monitoring**: Shows payment status, due dates, and loan progress
- **Tamper Detection**: Prevents factory reset and uninstallation attempts
- **Background Service**: Monitors payment status every 30 minutes
- **Offline Support**: Maintains lock state even without internet

## Installation

```bash
cd vistalock-device-agent
npm install
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
vistalock-device-agent/
├── src/
│   ├── services/
│   │   ├── api.js              # Backend API communication
│   │   └── deviceManager.js    # Device lock/unlock logic
│   ├── screens/
│   │   ├── ActivationScreen.js # Device activation
│   │   ├── LockScreen.js       # Shown when device is locked
│   │   └── NormalScreen.js     # Normal operation screen
│   └── utils/
├── App.js                       # Main app entry point
└── package.json
```

## How It Works

### 1. Activation Flow
1. Customer receives activation code from agent
2. Customer enters activation code + IMEI
3. Device registers with backend
4. Device Agent becomes active

### 2. Normal Operation
- Shows payment status and due dates
- Displays loan progress
- Sends heartbeat to backend every 30 minutes
- Checks lock status periodically

### 3. Lock Enforcement
- Backend sends lock command when payment is missed
- Device locks automatically
- Shows payment information and options
- Customer can make payment or check payment status
- Device unlocks automatically when payment confirmed

## Backend API Endpoints Required

The Device Agent requires the following backend endpoints:

- `POST /device-agent/register` - Register device
- `GET /device-agent/status/:deviceId` - Check lock status
- `GET /device-agent/payment-status/:deviceId` - Get payment info
- `POST /device-agent/heartbeat` - Send device heartbeat
- `POST /device-agent/tamper-alert` - Report tamper attempts

## Security Features

- Device Owner mode activation (Android)
- Tamper detection
- Factory reset prevention
- Uninstall prevention
- Encrypted communication with backend

## Configuration

Create a `.env` file:

```env
API_BASE_URL=https://api.vistalock.com
```

## Building for Production

```bash
# Build Android APK
expo build:android

# Build iOS IPA
expo build:ios
```

## License

Proprietary - Vistalock © 2026
