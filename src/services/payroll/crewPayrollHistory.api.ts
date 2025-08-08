import axiosInstance from "@/src/lib/axios";

export interface CrewPayrollHistoryItem {
  PostedPayrollID: number;
  PayrollMonth: number;
  PayrollYear: number;
  crewId: number;
  crewCode: string;
  crewName: string;
  rank: string;
  vesselId: number;
  vesselName: string;
  payrollDetails: {
    basicWage: string;
    fixedOT: string;
    guaranteedOT: string;
    dollarGross: string;
    pesoGross: string;
    totalDeduction: number;
    netWage: string;
  };
  allotmentDeductions: {
    name: string;
    currency: string;
    amount: string;
    forex: number;
    dollar: string;
  }[];
  allotteeDistribution: {
    name: string;
    amount: number;
    currency: number;
    bank: string;
    accountNumber: string;
  }[];
}

export interface CrewPayrollHsitoryResponse {
  success: boolean;
  data: CrewPayrollHistoryItem[];
  message?: string;
}

export const getCrewPayrollHistory = async (crewCode: number, ): Promise<CrewPayrollHsitoryResponse> => {
  //console.log("Fetching payroll history for crewCode:", crewCode);

  const response = await axiosInstance.get<CrewPayrollHsitoryResponse>(`/crew/${crewCode}/payrolls`);
  //console.log("API response from /crew/:crewCode/payrolls:", response.data);
  return response.data;
};
