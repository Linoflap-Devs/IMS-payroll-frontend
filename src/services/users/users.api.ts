import axiosInstance from "@/src/lib/axios";

export interface UsersItem {
  UserID: number;
  userId?: number;
  Name: string;
  FirstName?: string;
  LastName?: string;
  UserType: number;
  Role: any;
  Email: string;
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

export interface UpdateUserPayload {
  userId: number; 
  firstName: string;
  userType: number; 
  lastName: string;
}

export const updateUser = async (payload: UpdateUserPayload): Promise<UsersResponse> => {
  const response = await axiosInstance.patch<UsersResponse>(`/users/${payload.userId}`, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    userType: payload.userType,
  });
  return response.data;
};