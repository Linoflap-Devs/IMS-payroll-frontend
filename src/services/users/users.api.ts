import axiosInstance from "@/src/lib/axios";

export interface UsersItem {
  UserID: number;
  Name: string;
  UserType: number;
  Role: string;
}

export interface UsersResponse {
  success: boolean;
  data: UsersItem[];
  message?: string;
}

export const getUsersList = async (): Promise<UsersResponse> => {
  const response = await axiosInstance.get<UsersResponse>("/users");
  return response.data;
};