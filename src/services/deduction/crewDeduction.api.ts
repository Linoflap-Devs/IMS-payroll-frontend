import axiosInstance from "@/src/lib/axios";
import { DeductionDescriptionItem } from "./deductionDescription.api";

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

export interface AddDeductionResponse {
  success: boolean;
  data: DeductionDescriptionItem;
  message?: string;
}

export interface DeductionEntriesPayload {
  deductionID: number;
  deductionAmount: number;
  deductionRemarks?: string;
  deductionStatus: number;
}

export const addCrewDeductionEntry = async (crewCode: string, payload: DeductionEntriesPayload): Promise<AddDeductionResponse> => {
  const response = await axiosInstance.post<AddDeductionResponse>(`/deductions/${crewCode}/entries`, payload);
  return response.data;
}

export interface UpdateDeductionEntryPayload {
  deductionAmount?: number;
  deductionRemarks?: string;
  status?: number;
}

export const updateCrewDeductionEntry = async (crewCode: string, deductionId: number, payload: UpdateDeductionEntryPayload): Promise<AddDeductionResponse> => {
  const response = await axiosInstance.patch<AddDeductionResponse>(`/deductions/${crewCode}/entries/${deductionId}`, payload);
  return response.data;
}