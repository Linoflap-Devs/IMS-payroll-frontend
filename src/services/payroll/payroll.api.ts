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
export const getPayrollList = async (month: number, year: number): Promise<PayrollResponse> => {
  const response = await axiosInstance.get<PayrollResponse>(`/payroll?month=${month}&year=${year}`);
  return response.data;
}

export interface Allottee {
  AllotteeName: string;
  AccountNumber: string;
  Bank: string;
  NetAllotment: number;
  Currency: number;
}

export interface AllotmentRegisterCrew {
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

export interface AllotmentRegisterData {
  VesselID: number;
  VesselName: string;
  Crew: AllotmentRegisterCrew[];
}


export interface AllotmentRegisterResponse {
  success: boolean;
  message: string;
  data: AllotmentRegisterData[];
}

export const getVesselAllotmentRegister = async (vesselId: string | number): Promise<AllotmentRegisterResponse> => {
  const response = await axiosInstance.get<AllotmentRegisterResponse>(`/payroll/${vesselId}/allotment`);
  return response.data;
}

export interface Deductions {
  Name: string;
  Amount: number;
  ExchangeRate: number;
  Currency: number;

}

export interface DeductionRegister {
  CrewID: number;
  CrewName: string;
  Rank: string;
  Salary: number;
  Allotment: number;
  Gross: number;
  Deduction: number;
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

export interface PayslipPeriod {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  formattedPeriod: string;
}

export interface PayrollSummary {
  crewCount: number;
  totalBasicWage: number;
  totalFOT: number;
  totalGOT: number;
  totalDollarGross: number;
  totalPesoGross: number;
  totalDeductions: number;
  totalNetAllotment: number;
}

export interface PayrollDetails {
  basicWage: number;
  fixedOT: number;
  guaranteedOT: number;
  dollarGross: number;
  pesoGross: number;
  totalDeduction: number;
  netWage: number;
}

export interface AllotmentDeduction {
  name: string;
  currency: string;
  amount: number;
  forex: number;
  dollar: number;
}

export interface AllotteeDistribution {
  name: string;
  amount: number;
  currency: string | number;
}

export interface CrewPayroll {
  crewId: number;
  crewCode: string;
  crewName: string;
  rank: string;
  payrollDetails: PayrollDetails;
  allotmentDeductions: AllotmentDeduction[];
  allotteeDistribution: AllotteeDistribution[];
}

export interface PayslipData {
  vesselName: string;
  period: PayslipPeriod;
  summary: PayrollSummary;
  payrolls: CrewPayroll[];
}

export interface PayslipResponse {
  success: boolean;
  message: string;
  data: PayslipData;
}

export const getVesselPayslip = async (vesselId: string | number, month: number, year: number): Promise<PayslipResponse> => {
  const response = await axiosInstance.get<PayslipResponse>(`/payroll/${vesselId}/payslip?month=${month}&year=${year}`);
  return response.data;
}

export const postPayrolls = async (month: string, year: string): Promise<PayslipResponse> => {
  const response = await axiosInstance.post<PayslipResponse>("/payroll", { month, year });
  return response.data;
}

