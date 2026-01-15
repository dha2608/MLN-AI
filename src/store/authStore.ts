import { create } from 'zustand';
import api from '@/lib/api';
import { supabase } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  interests?: string[];
  last_seen?: string;
}

interface AuthState {
  session: any | null;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setSession: (session: any) => void;
  setAuthChecking: (isChecking: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthChecking: true,

  setSession: (session) => {
    if (session) {
      const { user } = session;
      const metadata = user.user_metadata || {};
      
      const mappedUser: User = {
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User',
        avatar_url: metadata.avatar_url,
      };

      // Only update if token actually changed or we are initializing
      if (get().token !== session.access_token) {
           localStorage.setItem('token', session.access_token);
      }
      
      set({ 
        session,
        token: session.access_token,
        user: mappedUser,
        isAuthChecking: false
      });
    } else {
      if (get().token) {
          // If we have a token but setSession(null) is called, it means logout or invalid session
          localStorage.removeItem('token');
      }
      set({ session: null, user: null, token: null, isAuthChecking: false });
    }
  },

  setAuthChecking: (isChecking) => set({ isAuthChecking: isChecking }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
          get().setSession(data.session);
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (error) throw error;
      
      // Auto login if session is returned (email confirmation off)
      if (data.session) {
          get().setSession(data.session);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error("Logout error", e);
    }
    localStorage.removeItem('token');
    set({ session: null, user: null, token: null });
  },

  checkAuth: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        get().setSession(session);
        // Optional: Fetch profile from API to get latest DB data (like bio, etc)
        // But for now session metadata is enough to pass build
        try {
             // We can try to fetch the full profile to get bio/interests
             const res = await api.get('/user/profile');
             const dbUser = res.data;
             set(state => ({
                 user: state.user ? { ...state.user, ...dbUser } : dbUser
             }));
        } catch (e) {
            // Ignore profile fetch error, keep session user
        }
      } else {
        set({ session: null, user: null, token: null, isAuthChecking: false });
        localStorage.removeItem('token');
      }
    } catch (e) {
      console.error("Auth check failed", e);
      set({ session: null, user: null, token: null, isAuthChecking: false });
      localStorage.removeItem('token');
    }
  },
}));
