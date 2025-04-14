import apiClient from './client';
import { removeCookie } from '@/utils/cookies';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    email: string;
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Authentication related API services
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
      return response;
    } catch (error: any) {
      // Return a structured error instead of throwing it
      // This prevents unwanted redirects from the interceptor
      return {
        data: {
          success: false,
          message: error.response?.data?.message || "Invalid credentials"
        },
        status: error.response?.status || 400
      } as any;
    }
  },

  /**
   * Logout the current user - client side only
   * This doesn't depend on a successful API call
   */
  logout: () => {
    // Remove auth cookies
    removeCookie('token');
    removeCookie('userEmail');
    
    // Redirect to login page
    window.location.href = '/';
  }
}; 