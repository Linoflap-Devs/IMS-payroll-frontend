import axiosInstance from "@/src/lib/axios";

export type DeductionType = "SSS" | "PHILHEALTH";

export interface SSSDeductionRate {
  contributionId?: number;
  salaryFrom: number;
  salaryTo: number;
  regularSS: number;
  mutualFund: number;
  eerate?: number;
  errate?: number;
  erss: number;
  ermf: number;
  ec: number;
  eess: number;
  eemf: number;
  ss?: number;
  mf?: number;
  Year: number;
}

export interface PHILHEALTHDeductionRate {
  contributionID?: number;
  salaryFrom: number;
  salaryTo: number;
  premium: number;
  premiumRate: number;
  Year: number;
}

type DeductionRateMap = {
  SSS: SSSDeductionRate[];
  PHILHEALTH: PHILHEALTHDeductionRate[];
};

interface DeductionGovtRatesBaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getDeductionGovtRates = async <T extends DeductionType>(year: number, type: T): Promise<DeductionGovtRatesBaseResponse<DeductionRateMap[T]>> => {
  const response = await axiosInstance.get(`/deductions/gov-rates?year=${year}&type=${type}`);
  return response.data;
};

interface SSSDeductionRequest {
  year: number;
  salaryFrom: number;
  salaryTo: number;
  eePremium?: number;
  eePremiumRate?: number;
  regularSS: number;
  mutualFund: number;
  ec: number;
  eess: number;
  erss: number;
  eemf: number;
  ermf: number;
}

export interface PhilHealthDeductionRequest {
  year: number;
  salaryFrom: number;
  salaryTo: number;
  eePremium: number;
  eePremiumRate: number;
}

type DeductionRequestMap = {
  SSS: SSSDeductionRequest;
  PHILHEALTH: PhilHealthDeductionRequest;
};

type DeductionGovtRatesBaseRequest<T extends DeductionType = DeductionType> =
  { type: T } & DeductionRequestMap[T];

export const addDeductionGovtRates = async <T extends DeductionType>(
  payload: DeductionGovtRatesBaseRequest<T>): Promise<DeductionGovtRatesBaseResponse<DeductionRateMap[T]>> => {
  const response = await axiosInstance.post("/deductions/gov-rates", payload);
  return response.data;
};


