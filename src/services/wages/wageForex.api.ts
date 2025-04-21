import axiosInstance from "@/src/lib/axios";

export interface WageForexItem {
  ExchangeRateYear: number;
  ExchangeRateMonth: number;
  ExchangeRate: number;
}

export interface WageForexResponse {
  success: boolean;
  data: WageForexItem[];
  message?: string;
}

export const getWageForexList = async (): Promise<WageForexResponse> => {
  const response = await axiosInstance.get<WageForexResponse>("/wages/forex");
  return response.data;
};