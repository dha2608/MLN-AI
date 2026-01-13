import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      set({ token: access_token });
      await get().checkAuth();
    } catch (error) {
        throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { email, password, name });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      set({ token: access_token });
      await get().checkAuth();
    } catch (error) {
        throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    // Avoid setting loading true if we just want to verify silently, but initial load needs it.
    // Let's handle it gracefully.
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, token: null });
        return;
      }
      const res = await api.get('/user/profile');
      set({ user: res.data });
    } catch (e) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
