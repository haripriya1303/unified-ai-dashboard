import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor — will use Supabase session token when available
api.interceptors.request.use(async (config) => {
  // Check custom backend token first
  const localToken = localStorage.getItem('access_token');
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`;
    return config;
  }

  // Fallback to Supabase
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Supabase not configured yet — continue without auth
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export default api;
