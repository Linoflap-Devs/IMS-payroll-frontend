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

export interface AddDeductionResponse {
  success: boolean;
  data: DeductionDescriptionItem;
  message?: string;
}

export const addDeductionDescription = async (crewCode: string, payload: DeductionDescriptionItem): Promise<AddDeductionResponse> => {
  const response = await axiosInstance.post<AddDeductionResponse>(`/deductions/${crewCode}/entries`, payload);
  return response.data;
}