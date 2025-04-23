import axiosInstance from "@/src/lib/axios";

export interface PayrollItem {
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