import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import ApiService from './api';

class DeviceManager {
    constructor() {
        this.isLocked = false;
        this.lockReason = null;
    }

    /**
     * Get device fingerprint (IMEI, Android ID, etc.)
     */
    async getDeviceFingerprint() {
        const fingerprint = {
            deviceModel: Device.modelName || 'Unknown',
            deviceBrand: Device.brand || 'Unknown',
            osVersion: Device.osVersion || 'Unknown',
            androidId: null,
            imei: null, // Note: IMEI requires native module
        };

        if (Platform.OS === 'android') {
            fingerprint.androidId = Application.getAndroidId();
        } else if (Platform.OS === 'ios') {
            fingerprint.iosId = await Application.getIosIdForVendorAsync();
        }

        return fingerprint;
    }

    /**
     * Check if device is registered
     */
    async isDeviceRegistered() {
        const deviceId = await AsyncStorage.getItem('deviceId');
        const deviceToken = await AsyncStorage.getItem('deviceToken');
        return !!(deviceId && deviceToken);
    }

    /**
     * Register device with activation code
     */
    async registerDevice(activationCode, imei) {
        const fingerprint = await this.getDeviceFingerprint();

        const registrationData = {
            ...fingerprint,
            imei,
            activationCode,
        };

        const response = await ApiService.registerDevice(registrationData);

        // Store registration data
        await AsyncStorage.setItem('registeredAt', new Date().toISOString());
        await AsyncStorage.setItem('loanId', response.loanId);
        await AsyncStorage.setItem('lockPolicy', JSON.stringify(response.lockPolicy));

        return response;
    }

    /**
     * Check lock status from backend
     */
    async checkLockStatus() {
        try {
            const status = await ApiService.checkDeviceStatus();

            if (status.shouldLock && !this.isLocked) {
                await this.lockDevice(status.lockReason);
            } else if (!status.shouldLock && this.isLocked) {
                await this.unlockDevice();
            }

            return status;
        } catch (error) {
            console.error('Failed to check lock status:', error);
            // If can't reach server, maintain current lock state
            return { isLocked: this.isLocked };
        }
    }

    /**
     * Lock the device
     */
    async lockDevice(reason = 'Payment overdue') {
        this.isLocked = true;
        this.lockReason = reason;

        await AsyncStorage.setItem('isLocked', 'true');
        await AsyncStorage.setItem('lockReason', reason);
        await AsyncStorage.setItem('lockedAt', new Date().toISOString());

        console.log('Device locked:', reason);
    }

    /**
     * Unlock the device
     */
    async unlockDevice() {
        this.isLocked = false;
        this.lockReason = null;

        await AsyncStorage.setItem('isLocked', 'false');
        await AsyncStorage.removeItem('lockReason');
        await AsyncStorage.removeItem('lockedAt');

        console.log('Device unlocked');
    }

    /**
     * Get current lock state
     */
    async getLockState() {
        const isLocked = await AsyncStorage.getItem('isLocked');
        const lockReason = await AsyncStorage.getItem('lockReason');

        this.isLocked = isLocked === 'true';
        this.lockReason = lockReason;

        return {
            isLocked: this.isLocked,
            lockReason: this.lockReason,
        };
    }

    /**
     * Start background monitoring
     */
    async startMonitoring() {
        // Check lock status every 30 minutes
        setInterval(async () => {
            await this.checkLockStatus();
            await ApiService.sendHeartbeat();
        }, 30 * 60 * 1000); // 30 minutes

        // Initial check
        await this.checkLockStatus();
    }

    /**
     * Detect tamper attempts
     */
    async detectTamper() {
        // This would be implemented with native modules
        // For now, just a placeholder
        console.log('Tamper detection active');
    }
}

export default new DeviceManager();
