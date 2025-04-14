import apiClient from './client';

/**
 * General API services for common operations
 */
export const generalService = {
  /**
   * Generic GET request
   */
  get: <T>(url: string, params?: any) => {
    return apiClient.get<T>(url, { params });
  },

  /**
   * Generic POST request
   */
  post: <T>(url: string, data?: any) => {
    return apiClient.post<T>(url, data);
  },

  /**
   * Generic PUT request
   */
  put: <T>(url: string, data?: any) => {
    return apiClient.put<T>(url, data);
  },

  /**
   * Generic DELETE request
   */
  delete: <T>(url: string) => {
    return apiClient.delete<T>(url);
  }
}; 