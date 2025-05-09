import axiosInstance from "../../lib/axios";

export interface WageDescriptionItem {
  WageID: number;
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

export interface updateWageDescriptionPayload {
  wageID: number;
  wageCode: string;
  wageName: string;
  payableOnBoard: number;
}

export interface updateWageDescriptionResponse {
  success: boolean;
  data: WageDescriptionItem;
  message?: string;
}
export const updateWageDescription = async (
  payload: updateWageDescriptionPayload
): Promise<updateWageDescriptionResponse> => {
  const response = await axiosInstance.patch<updateWageDescriptionResponse>(
    `/wages/description/${payload.wageID}`,
    {
      wageCode: payload.wageCode,
      wageName: payload.wageName,
      payableOnBoard: payload.payableOnBoard,
    }
  );
  return response.data;
}