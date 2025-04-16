import axiosInstance from "../../lib/axios";

export interface SalaryScaleItem {
  RankID: number;
  WageID: number;
  Rank: string;
  WageAmount: number;
  Wage: string;
  VesselTypeId: number;
  VesselTypeName: string;
}

export interface SalaryScaleResponse {
  success: boolean;
  data: SalaryScaleItem[];
  message?: string;
}

export const getSalaryScaleList = async (): Promise<SalaryScaleResponse> => {
  const response = await axiosInstance.get<SalaryScaleResponse>("/wages/scale");
  return response.data;
};



