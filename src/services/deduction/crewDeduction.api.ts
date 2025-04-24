import axiosInstance from "@/src/lib/axios";

export interface CrewDeductionItem {
  CrewCode: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Rank: string;
  VesselName: string;
}

export interface CrewDeductionResponse {
  success: boolean;
  data: CrewDeductionItem[];
  message?: string;
}
export const getCrewDeductionList = async (): Promise<CrewDeductionResponse> => {
  const response = await axiosInstance.get<CrewDeductionResponse>("/deductions");
  return response.data;
}