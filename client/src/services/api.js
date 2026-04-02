import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }),
  summary: (period) => api.get('/transactions/summary', { params: { period } }),
  categories: (period) => api.get('/transactions/categories', { params: { period } })
};

export const gamificationApi = {
  xp: () => api.get('/gamification/xp'),
  quests: () => api.get('/gamification/quests'),
  streaks: () => api.get('/gamification/streaks')
};

export default api;
