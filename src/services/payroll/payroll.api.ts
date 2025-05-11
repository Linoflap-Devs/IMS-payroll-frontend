import axiosInstance from "@/src/lib/axios";

export interface PayrollItem {
  VesselId: number;
  VesselName: string;
  OnBoardCrew: number;
  GrossAllotment: number;
  NetAllotment: number;
  TotalDeduction: number;
}
export interface PayrollResponse {
  success: boolean;
  data: PayrollItem[];
  message?: string;
}
export const getPayrollList = async (): Promise<PayrollResponse> => {
  const response = await axiosInstance.get<PayrollResponse>("/payroll");
  return response.data;
}

export interface Allottee {
  AllotteeName: string;
  AccountNumber: string;
  Bank: string;
  NetAllotment: number;
  Currency: number;
}

export interface AllotmentRegister {
  CrewID: number;
  CrewName: string;
  Rank: string;
  BasicWage: string;
  FixedOT: string;
  GuarOT: string;
  DollarGross: string;
  PesoGross: number;
  TotalDeduction: number;
  Net: number;
  Allottee: Allottee[];
}

export interface AllotmentRegisterResponse {
  success: boolean;
  message: string;
  data: AllotmentRegister[];
}

export const getVesselAllotmentRegister = async (vesselId: string | number): Promise<AllotmentRegisterResponse> => {
  const response = await axiosInstance.get<AllotmentRegisterResponse>(`/payroll/${vesselId}/allotment`);
  return response.data;
}

export interface Deductions{
  Name: string;
  Amount: number;
  ExchangeRate: number;
  Currency: number;

}

export interface DeductionRegister{
  CrewID:number;
  CrewName: string;
  Rank: string;
  Salary: number;
  Allotment: number;
  Gross: number;
  Deduction:number;
  Deductions: Deductions[];
}

export interface DeductionRegisterResponse {
  success: boolean;
  message: string;
  data: DeductionRegister[];
}

export const getVesselDeductionRegister = async (vesselId: string | number, month: number, year: number): Promise<DeductionRegisterResponse> => {
  const response = await axiosInstance.get<DeductionRegisterResponse>(`/payroll/${vesselId}/deduction?month=${month}&year=${year}`);
  return response.data;
}