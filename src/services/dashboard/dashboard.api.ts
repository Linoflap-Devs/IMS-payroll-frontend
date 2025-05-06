import axiosInstance from "@/src/lib/axios";

export interface SalaryProcessedItem {
  MonthYear: string; // ISO string format
  Value: number;
}

export interface DashboardItem {
  TotalVessels: number;
  TotalActiveCrew: number;
  TotalOnBoard: number;
  TotalOffBoard: number;
  ForexRate: number;
  MonthlyAllotmentPHP: number;
  MonthlyAllotmentUSD: number;
  PerVesselAllotmentPHP: {
    [vesselName: string]: number;
  };
  PerVesselAllotmentUSD: {
    [vesselName: string]: number;
  };
  TotalSalaryProcessed: SalaryProcessedItem[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardItem;
}

export const getDashboardList = async (): Promise<DashboardResponse> => {
  const response = await axiosInstance.get<DashboardResponse>("/dashboard");
  return response.data;
}
