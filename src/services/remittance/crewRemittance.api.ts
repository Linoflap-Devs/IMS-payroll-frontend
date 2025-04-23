import axiosInstance from "@/src/lib/axios";

export interface CrewRemittanceItem {
  CrewID: number;
  CrewCode: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Rank: string;
  RankID: number;
  Vessel: string;
}
export interface CrewRemittanceResponse {
  success: boolean;
  data: CrewRemittanceItem[];
  message?: string;
}
export const getCrewRemittanceList = async (): Promise<CrewRemittanceResponse> => {
  const response = await axiosInstance.get<CrewRemittanceResponse>("/remittance");
  return response.data;
}