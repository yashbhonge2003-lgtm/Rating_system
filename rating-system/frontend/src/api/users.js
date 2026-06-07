import api from './axios';

export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updatePassword = (id, data) => api.patch(`/users/${id}/password`, data);
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
