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

export interface DeductionEntries {
  DeductionDetailID: number;
  Month: string;
  Year: number;
  Deduction: string;
  Amount: number;
  Remarks: string;
  Status: number;
}

export interface DeductionEntriesResponse {
  success: boolean;
  data: DeductionEntries[];
  message?: string;
}

export const getDeductionEntries = async (crewCode: string): Promise<DeductionEntriesResponse> => {
  const response = await axiosInstance.get<DeductionEntriesResponse>(`/deductions/${crewCode}/entries`);
  return response.data;
}