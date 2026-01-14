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
  isAuthChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setSession: (session: any) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthChecking: true,
  setSession: (session) => {
    if (session) {
      // Only update if token actually changed to prevent loops
      if (get().token === session.access_token) {
           // Even if token matches, we might need to stop loading if it was stuck
           if (get().isAuthChecking) set({ isAuthChecking: false });
           return;
      }
      
      localStorage.setItem('token', session.access_token);
      set({ 
        token: session.access_token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url
        },
        isAuthChecking: false
      });
      // Fetch latest profile from DB to ensure avatar/name are up to date
      get().checkAuth();
    } else {
      // If no session, but we have a token in local storage, maybe we are still checking?
      // No, supabase.auth.getSession() returns null session if not logged in.
      if (get().token) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthChecking: false });
      } else {
           // Just stop checking
           if (get().isAuthChecking) set({ isAuthChecking: false });
      }
    }
  },
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
  logout: async () => {
    const { error } = await import('@/lib/api').then(m => m.supabase.auth.signOut());
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
