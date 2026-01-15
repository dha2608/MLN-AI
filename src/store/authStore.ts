import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthChecking: boolean;
  setSession: (session: Session | null) => void;
  setAuthChecking: (isChecking: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthChecking: true,
  setSession: (session) => set({ 
    session, 
    user: session?.user || null,
    isAuthChecking: false 
  }),
  setAuthChecking: (isChecking) => set({ isAuthChecking: isChecking }),
  signOut: () => {
    localStorage.removeItem('token');
    set({ session: null, user: null });
  }
}));
