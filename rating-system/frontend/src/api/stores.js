import api from './axios';

export const getStores = (params) => api.get('/stores', { params });
export const getAdminStores = (params) => api.get('/stores/admin', { params });
export const createStore = (data) => api.post('/stores', data);
export const getStore = (id) => api.get(`/stores/${id}`);
export const updateStore = (id, data) => api.patch(`/stores/${id}`, data);
