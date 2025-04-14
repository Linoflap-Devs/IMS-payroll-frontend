import axios from 'axios';
import { getCookie, removeCookie } from '@/utils/cookies';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 errors if not trying to login or register
    const isAuthEndpoint = 
      error.config?.url && 
      (error.config.url.includes('/api/auth/login') || 
       error.config.url.includes('/api/auth/register'));
       
    if (error.response?.status === 401 && !isAuthEndpoint) {
      removeCookie('token');
      removeCookie('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 