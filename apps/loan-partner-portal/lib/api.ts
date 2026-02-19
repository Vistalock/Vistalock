import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Only redirect if we are not already on the login page
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getPartnerApplications = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.get(`/partner/applications?partnerId=${partnerId}`);
    return response.data;
};

export const processLoanDecision = async (loanId: string, decision: 'APPROVE' | 'REJECT') => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.post('/partner/applications/decision', { partnerId, loanId, decision });
    return response.data;
};

export const getPartnerCommissions = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.get(`/partner/commissions?partnerId=${partnerId}`);
    return response.data;
};

export const getPartnerDisputes = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.get(`/partner/disputes?partnerId=${partnerId}`);
    return response.data;
};

export const resolveDispute = async (disputeId: string, resolution: string, status: 'RESOLVED' | 'REJECTED') => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.post('/partner/disputes/resolve', { partnerId, disputeId, resolution, status });
    return response.data;
};

export const getIntegrations = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.get(`/partner/integrations?partnerId=${partnerId}`);
    return response.data;
};

export const rotateApiKey = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.post('/partner/rotate-key', { partnerId });
    return response.data;
};

export const updateWebhook = async (webhookUrl: string, webhookSecret?: string) => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.post('/partner/webhook', { partnerId, webhookUrl, webhookSecret });
    return response.data;
};

export const getTeamMembers = async () => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.get(`/partner/team?partnerId=${partnerId}`);
    return response.data;
};

export const inviteTeamMember = async (email: string, role: string) => {
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const partnerId = partner.id;
    if (!partnerId) throw new Error('Partner ID not found');
    const response = await api.post('/partner/invite', { partnerId, email, role });
    return response.data;
};

export { api };
