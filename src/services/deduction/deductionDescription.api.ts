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