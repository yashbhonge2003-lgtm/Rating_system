import api from './axios';

export const createRating = (data) => api.post('/ratings', data);
export const updateRating = (id, data) => api.patch(`/ratings/${id}`, data);
export const getStoreRatings = (storeId) => api.get(`/ratings/store/${storeId}`);
