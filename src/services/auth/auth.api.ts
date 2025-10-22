
import axiosInstance from "../../lib/axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    email: string;
    userType: number;
  };
  message: string;
}

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/login", data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.delete("/auth/logout");
};

export const getCurrentUser = async (): Promise<
  {
    isAuthenticated: any; 
    Email: string
    FirstName: string
    LastName: string
    UserType: number
    UserTypeName: string 
  }> => {
    const response = await axiosInstance.get("/auth/current-user");
    return response.data.data;
};