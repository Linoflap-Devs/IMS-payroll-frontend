import axiosInstance from "@/src/lib/axios";

export interface SSSDeductionCrew {
  CrewID: number;
  CrewName: string;
  SSNumber: string;
  Rank: string;
  Salary: number;
  Allotment: number;
  Gross: number;
  RegularSS: number;
  MutualFund: number;
  EESS: number;
  ERSS: number;
  EEMF: number;
  ERMF: number;
  EC: number;
}

export interface PhilhealthDeductionCrew {
  CrewID: number;
  CrewName: string;
  Rank: string;
  PHNumber: string;
  Salary: number;
  Allotment: number;
  Gross: number;
  EE: number;
  ER: number;
  EEPremium: number;
  EEPremiumRate: number;
}

export interface HDMFDeductionCrew {
  CrewID: number;
  CrewName: string;
  Rank: string;
  HDMFNumber: string;
  Salary: number;
  Allotment: number;
  Gross: number;
  EE: number;
  ER: number;
}

// Top-level vessel + crew grouping
export interface DeductionItem<TCrew> {
  VesselID: number;
  VesselName: string;
  VesselCode: string;
  VesselType: string;
  Principal: string;
  IsActive: number;
  ExchangeRate: number;
  Crew: TCrew[];
}

// FINAL FIX: Make DeductionResponse generic!
export interface DeductionResponse<TCrew> {
  success: boolean;
  message: string;
  data: DeductionItem<TCrew>[];
}

export const getSSSDeductionList = async (
  vesselId: string | number,
  month: number,
  year: number
): Promise<DeductionResponse<SSSDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<SSSDeductionCrew>>(
    `/deductions/vessel/${vesselId}/sss?month=${month}&year=${year}`
  );
  return response.data;
};

export const getPhilhealthDeductionList = async (
  vesselId: string | number,
  month: number,
  year: number
): Promise<DeductionResponse<PhilhealthDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<PhilhealthDeductionCrew>>(
    `/deductions/vessel/${vesselId}/philhealth?month=${month}&year=${year}`
  );
  return response.data;
};

export const getAllPhilhealthDeductionList = async (
  month: number,
  year: number
): Promise<DeductionResponse<PhilhealthDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<PhilhealthDeductionCrew>>(
    `/deductions/vessel/philhealth?month=${month}&year=${year}`
  );
  return response.data;
}

export const getAllSSSDeductionList = async (
  month: number,
  year: number
): Promise<DeductionResponse<SSSDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<SSSDeductionCrew>>(
    `/deductions/vessel/sss?month=${month}&year=${year}`
  );
  return response.data;
}

export const getAllHDMFDeductionList = async (
  month: number,
  year: number
): Promise<DeductionResponse<HDMFDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<HDMFDeductionCrew>>(
    `/deductions/vessel/hdmf?month=${month}&year=${year}`
  );
  return response.data;
}

export const getHMDFDeductionList = async (
  vesselId: string | number,
  month: number,
  year: number
): Promise<DeductionResponse<HDMFDeductionCrew>> => {
  const response = await axiosInstance.get<DeductionResponse<HDMFDeductionCrew>>(
    `/deductions/vessel/${vesselId}/hdmf?month=${month}&year=${year}`
  );
  return response.data;
};

// reusable types
export type SSSDeductionItem = DeductionItem<SSSDeductionCrew>;
export type PhilhealthDeductionItem = DeductionItem<PhilhealthDeductionCrew>;
export type HMDFDeductionItem = DeductionItem<HDMFDeductionCrew>;

