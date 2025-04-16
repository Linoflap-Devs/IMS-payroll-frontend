import axiosInstance from "../../lib/axios";

export interface WageDescriptionItem {
  WageCode: string;
  WageName: string;
  PayableOnBoard: number;
}

export interface WageDescriptionResponse {
  success: boolean;
  data: WageDescriptionItem[];
  message?: string;
}

export const getWageDescriptionList = async (): Promise<WageDescriptionResponse> => {
  const response = await axiosInstance.get<WageDescriptionResponse>("/wages/description");
  return response.data;
};

