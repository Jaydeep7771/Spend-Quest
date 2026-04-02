import { create } from 'zustand';
import { authApi, setAuthToken } from '../services/api.js';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  async login(email, password) {
    const res = await authApi.login({ email, password });
    setAuthToken(res.data.data.access_token);
    set({ token: res.data.data.access_token, user: res.data.data.user });
  },
  logout() {
    setAuthToken(null);
    set({ user: null, token: null });
  }
}));
