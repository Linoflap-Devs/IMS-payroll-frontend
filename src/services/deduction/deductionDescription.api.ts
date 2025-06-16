import axiosInstance from "@/src/lib/axios";

export interface DeductionDescriptionItem {
  DeductionID: number;
  DeductionCode: string;
  DeductionName: string;
  DeductionType: number;
  DeductionCurrency: number;
}

export interface DeductionDescriptionResponse {
  success: boolean;
  data: DeductionDescriptionItem[];
  message?: string;
}

export const getDeductionDescriptionList = async (): Promise<DeductionDescriptionResponse> => {
  const response = await axiosInstance.get<DeductionDescriptionResponse>("/deductions/description");
  return response.data;
};

export interface editDescriptionPayload {
  deductionCode: string;
  deductionName: string;
  deductionType: number;
  currency: string;
}

export const editDeductionDescription = async (descriptionId: number, payload: editDescriptionPayload): Promise<DeductionDescriptionResponse> => {
  const response = await axiosInstance.patch<DeductionDescriptionResponse>(`/deductions/description/${descriptionId}`, payload);
  return response.data;
}

export interface addDeductionDescriptionPayload {
  deductionCode: string;
  deductionName: string;
  deductionType: number;
  currency: string;
}

export const addDeductionDescription = async (payload: addDeductionDescriptionPayload): Promise<DeductionDescriptionResponse> => {
  const response = await axiosInstance.post<DeductionDescriptionResponse>("/deductions/description", payload);
  return response.data;
}

export const deleteDeductionDescription = async (descriptionId: number): Promise<DeductionDescriptionResponse> => {
  const response = await axiosInstance.delete<DeductionDescriptionResponse>(`/deductions/description/${descriptionId}`);
  return response.data;
}
