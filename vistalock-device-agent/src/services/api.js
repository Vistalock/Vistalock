import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000'; // Will be configured via env

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });

        // Add auth token to all requests
        this.client.interceptors.request.use(async (config) => {
            const token = await AsyncStorage.getItem('deviceToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Register device with backend
     */
    async registerDevice(data) {
        const response = await this.client.post('/device-agent/register', {
            imei: data.imei,
            androidId: data.androidId,
            deviceModel: data.deviceModel,
            loanId: data.loanId,
            activationCode: data.activationCode,
        });

        // Store device token
        if (response.data.deviceToken) {
            await AsyncStorage.setItem('deviceToken', response.data.deviceToken);
            await AsyncStorage.setItem('deviceId', response.data.deviceId);
        }

        return response.data;
    }

    /**
     * Check device status and lock policy
     */
    async checkDeviceStatus() {
        const deviceId = await AsyncStorage.getItem('deviceId');
        const response = await this.client.get(`/device-agent/status/${deviceId}`);
        return response.data;
    }

    /**
     * Get payment status
     */
    async getPaymentStatus() {
        const deviceId = await AsyncStorage.getItem('deviceId');
        const response = await this.client.get(`/device-agent/payment-status/${deviceId}`);
        return response.data;
    }

    /**
     * Send heartbeat (device is active)
     */
    async sendHeartbeat() {
        const deviceId = await AsyncStorage.getItem('deviceId');
        await this.client.post('/device-agent/heartbeat', {
            deviceId,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Report tamper attempt
     */
    async reportTamper(type, details) {
        const deviceId = await AsyncStorage.getItem('deviceId');
        await this.client.post('/device-agent/tamper-alert', {
            deviceId,
            type, // 'FACTORY_RESET' | 'UNINSTALL_ATTEMPT' | 'SAFE_MODE'
            details,
            timestamp: new Date().toISOString(),
        });
    }
}

export default new ApiService();
