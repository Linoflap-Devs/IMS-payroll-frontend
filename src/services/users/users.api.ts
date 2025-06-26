import axiosInstance from "@/src/lib/axios";

export interface UsersItem {
  UserID: number;
  Name: string;
  UserType: number;
  Role: any;
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


export interface AddUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: number;
}

export const addUsers = async (payload: AddUserPayload): Promise<UsersResponse> => {
  const response = await axiosInstance.post<UsersResponse>("/auth/register", payload);
  return response.data;
};