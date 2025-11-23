import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dashboard APIs
export const dashboardApi = {
    getStats: () => api.get('/api/dashboard/stats'),
    getLeadsOverTime: (days: number = 30) => api.get(`/api/dashboard/leads-over-time?days=${days}`),
    getLeadsByCampaign: () => api.get('/api/dashboard/leads-by-campaign'),
    getCampaignsOverview: () => api.get('/api/dashboard/campaigns-overview'),
};

// Campaign Detail APIs
export const campaignApi = {
    getStats: (id: number) => api.get(`/api/campaigns/${id}/stats`),
    getLeadsOverTime: (id: number, days: number = 30) => api.get(`/api/campaigns/${id}/leads-over-time?days=${days}`),
    getLeads: (id: number, status?: string) => {
        const params = status ? `?status=${status}` : '';
        return api.get(`/api/campaigns/${id}/leads${params}`);
    },
    getAutomations: (id: number) => api.get(`/api/campaigns/${id}/automations`),
};

// Webhook APIs
export const webhookApi = {
    list: (campaignId?: number) => {
        const params = campaignId ? `?campaign_id=${campaignId}` : '';
        return api.get(`/api/webhooks/${params}`);
    },
    create: (data: any) => api.post('/api/webhooks/', data),
    get: (id: number) => api.get(`/api/webhooks/${id}`),
    update: (id: number, data: any) => api.patch(`/api/webhooks/${id}`, data),
    delete: (id: number) => api.delete(`/api/webhooks/${id}`),
    regenerateSecret: (id: number) => api.post(`/api/webhooks/${id}/regenerate-secret`),
    getEvents: (id: number, limit: number = 50) => api.get(`/api/webhooks/${id}/events?limit=${limit}`),
};

// Integration APIs
export const integrationApi = {
    list: () => api.get('/api/integrations/'),
    getStatus: (id: number) => api.get(`/api/integrations/${id}/status`),
};

// Automation APIs
export const automationApi = {
    list: (campaignId?: number) => {
        const params = campaignId ? `?campaign_id=${campaignId}` : '';
        return api.get(`/api/automations/${params}`);
    },
    create: (data: any) => api.post('/api/automations/', data),
    update: (id: number, data: any) => api.patch(`/api/automations/${id}`, data),
    delete: (id: number) => api.delete(`/api/automations/${id}`),
};

export default api;
