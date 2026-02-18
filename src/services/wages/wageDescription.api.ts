import axiosInstance from "../../lib/axios";

export interface WageDescriptionItem {
  WageID: number;
  WageCode: string;
  WageName: string;
  PayableOnboard: number;
}

export interface WageDescriptionResponse {
  success: boolean;
  data: WageDescriptionItem[];
  message?: string;
}

export interface updateWageDescriptionPayload {
  wageID: number;
  wageCode: string;
  wageName: string;
  wagePayableOnBoard: number;
}

export interface updateWageDescriptionResponse {
  success: boolean;
  data: WageDescriptionItem;
  message?: string;
}

export const getWageDescriptionList = async (): Promise<WageDescriptionResponse> => {
  const response = await axiosInstance.get<WageDescriptionResponse>("/wages/description");
  return response.data;
};

export interface AddWageDescriptionPayload {
  wageCode: string;
  wageName: string;
  wagePayableOnBoard: number;
}

export interface IWageDescriptionResponse {
  success: boolean;
  message?: string;
  data?: WageDescriptionItem;
}

export const addWageDescription = async (payload: AddWageDescriptionPayload) => {
  const response = await axiosInstance.post<IWageDescriptionResponse>("/wages/description", {
    wageCode: payload.wageCode,
    wageName: payload.wageName,
    wagePayableOnBoard: payload.wagePayableOnBoard,
  });
  return response.data;
}

export const updateWageDescription = async (
  payload: updateWageDescriptionPayload
): Promise<updateWageDescriptionResponse> => {
  const response = await axiosInstance.patch<updateWageDescriptionResponse>(
    `/wages/description/${payload.wageID}`,
    {
      wageCode: payload.wageCode,
      wageName: payload.wageName,
      wagePayableOnBoard: payload.wagePayableOnBoard,
    }
  );
  return response.data;
}

export const deleteWageDescription = async (wageID: number): Promise<IWageDescriptionResponse> => {
  const response = await axiosInstance.delete<IWageDescriptionResponse>(`/wages/description/${wageID}`)
  return response.data;
}