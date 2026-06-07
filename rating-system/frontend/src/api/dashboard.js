import api from './axios';

export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getStoreOwnerDashboard = () => api.get('/dashboard/store-owner');
