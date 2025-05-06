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

export interface CrewRemittanceDetailItem {
  RemittanceHeaderID: number;
  RemittanceID: number;
  AllotteeID: number;
  AllotteeName: string;
  Amount: number;
  Remarks: string;
  Month: string;
  Year: number;
  IsActive: number;
}

export interface CrewRemittanceDetailResponse {
  success: boolean;
  data: CrewRemittanceDetailItem[];
  message?: string;
}

export const getCrewRemittanceDetails = async (crewCode: string): Promise<CrewRemittanceDetailResponse> => {
  const response = await axiosInstance.get<CrewRemittanceDetailResponse>(`/remittance/${crewCode}`);
  return response.data;
}

