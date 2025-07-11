import axiosInstance from "@/src/lib/axios";

export interface UsersItem {
  [x: string]: any;
  UserID: number;
  userId?: number;
  Name: string;
  FirstName?: string;
  LastName?: string;
  UserType: number;
  Role: any;
  Email: string;
  IsVerified: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface UsersResponse {
  success: boolean;
  data: UsersItem;
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

export const deleteUser = async (userId: number) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
    };
  }
};

type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

export const resetPassword = async (userId: number): Promise<ResetPasswordResponse> => {
  try {
    const response = await axiosInstance.put(`users/reset-password/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset the password",
    };
  }
};

export interface LoginHistoryItem {
  LoginHistoryId: number;
  FirstName?: number;
  LastName: string;
  Action?: string;
  UserAgent?: string;
  IPAddress: number;
  CreatedAt: any;
}

export interface LoginHistoryResponse {
  success: boolean;
  data: LoginHistoryItem[];
  message?: string;
}

export const loginHistory = async (): Promise<LoginHistoryResponse> => {
  const response = await axiosInstance.get<LoginHistoryResponse>("/users/login-history");
  return response.data;
};

export interface UpdatePasswordItem {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// `/auth/update-password/${userId}`
// userId: number, 
export const updatePassword = async (passwordData: UpdatePasswordItem ): Promise<UpdatePasswordResponse> => {
  try {
    const response = await axiosInstance.put("/auth/update-password", passwordData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset the password",
    };
  }
};

