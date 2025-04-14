import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other user properties as needed
}

/**
 * Users related API services
 */
export const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: () => {
    return apiClient.get<{ success: boolean; data: User }>('/api/users/me');
  },
  
  /**
   * Get user by ID
   */
  getUserById: (userId: string) => {
    return apiClient.get<{ success: boolean; data: User }>(`/api/users/${userId}`);
  },
  
  /**
   * Update user profile
   */
  updateProfile: (userData: Partial<User>) => {
    return apiClient.put<{ success: boolean; data: User }>('/api/users/profile', userData);
  }
}; 