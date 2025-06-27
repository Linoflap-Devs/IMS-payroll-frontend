import axiosInstance from "@/src/lib/axios";

export interface WageForexItem {
  ExchangeRateID: number;
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

export interface IEditWagePayload {
  // exchangeRateIdD: number;
  exchangeRateMonth: number;
  exchangeRateYear: number;
  exchangeRate: number;
}

export interface AddForexPayload {
  year: number;
  month: number;
  rate: number;
}

export const editWageForex = async (forexId: number, payload: IEditWagePayload): Promise<WageForexResponse> => {
  const response = await axiosInstance.patch<WageForexResponse>(`/wages/forex/${forexId}`, payload);
  return response.data;
};

export const deleteWageForex = async (forexId: number): Promise<WageForexResponse> => {
  const response = await axiosInstance.delete<WageForexResponse>(`/wages/forex/${forexId}`);
  return response.data;
};

export const addWageForex = async (payload: AddForexPayload): Promise<WageForexResponse> => {
  const response = await axiosInstance.post<WageForexResponse>("/wages/forex", payload);
  return response.data;
};