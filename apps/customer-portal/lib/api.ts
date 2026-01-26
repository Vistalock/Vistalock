import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Add interceptor to attach token if we save it (later)
api.interceptors.request.use((config) => {
    // For now, customer portal might store token in localStorage 'customer_token'
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('customer_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
