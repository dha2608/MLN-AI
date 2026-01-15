import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Check if session exists in supabase auth
  const sbSession = JSON.parse(localStorage.getItem('sb-access-token') || 'null'); // Example key, supabase uses specific key usually
  
  // Actually, we just need the token.
  if (token) {
    // Ensure "Bearer" is not duplicated if someone manually added it
    if (token.startsWith('Bearer ')) {
        config.headers.Authorization = token;
    } else {
        config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
