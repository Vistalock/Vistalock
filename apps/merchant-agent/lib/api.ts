import axios from 'axios';

// Get API URLs from environment variables (or defaults)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vistalock-auth.onrender.com';
const CREDIT_API_URL = process.env.EXPO_PUBLIC_CREDIT_API_URL || 'http://192.168.100.45:3004';

// Main API instance (Auth Service)
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 10000,
});

// Credit Service API instance
export const creditApi = axios.create({
    baseURL: CREDIT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        // TODO: Get token from secure storage
        // const token = await SecureStore.getItemAsync('userToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Global error handling (e.g., toast notifications)
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);
export const clearAuthToken = async () => {
    // Placeholder for when SecureStore is available
    // await SecureStore.deleteItemAsync('userToken');
    api.defaults.headers.common['Authorization'] = '';
    return Promise.resolve();
};
