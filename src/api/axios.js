import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('crps_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect/refresh if we are already on the login page or if this WAS a login request.
      // This allows the Login component to handle the error and show a message.
      const isLoginRequest = err.config?.url?.includes('/auth/login');
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginRequest && !isLoginPage) {
        sessionStorage.removeItem('crps_token');
        sessionStorage.removeItem('crps_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
