
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

export const getCurrentUser = async (): Promise<{ Email: string; UserType: number }> => {
  const response = await axiosInstance.get("/auth/current-user");
  return response.data.data;
};