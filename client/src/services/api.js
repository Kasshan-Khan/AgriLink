import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrilink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Centers
export const getCenters = () => API.get('/centers');
export const getCenter = (id) => API.get(`/centers/${id}`);
export const createCenter = (data) => API.post('/centers', data);
export const updateCenter = (id, data) => API.put(`/centers/${id}`, data);
export const deleteCenter = (id) => API.delete(`/centers/${id}`);
export const assignManager = (id, data) => API.put(`/centers/${id}/assign-manager`, data);

// Produce
export const getAllProduce = (params) => API.get('/produce', { params });
export const getProduceByCenter = (centerId) => API.get(`/produce/center/${centerId}`);
export const getProduceByFarmer = (farmerId) => API.get(`/produce/farmer/${farmerId}`);
export const createProduce = (data) => API.post('/produce', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getProduceStats = () => API.get('/produce/stats');

// Credits
export const getFarmerCredit = (farmerId) => API.get(`/credits/farmer/${farmerId}`);
export const issueCredit = (data) => API.post('/credits', data);
export const recordRepayment = (data) => API.post('/credits/repay', data);
export const getCreditStats = () => API.get('/credits/stats');

// Users
export const getUsers = (params) => API.get('/users', { params });
export const getFarmers = () => API.get('/users/farmers');
export const createManager = (data) => API.post('/users/managers', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const getUserStats = () => API.get('/users/stats');

export default API;
