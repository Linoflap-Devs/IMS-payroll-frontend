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
  contributionId?: number;
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
  contributionId: number;
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

export interface UpdateDeductionGovtRatesPayload {
  contributionID?: number;
  contributionId?: number;
  type: DeductionType;
  data: Partial<SSSDeductionRequest | PhilHealthDeductionRequest>;
}
export const updateDeductionGovtRates = async (
  payload: UpdateDeductionGovtRatesPayload
): Promise<DeductionGovtRatesBaseResponse<DeductionRateMap[typeof payload.type]>> => {
  const { contributionId, type, data } = payload;

  try {
  const response = await axiosInstance.patch<
    DeductionGovtRatesBaseResponse<DeductionRateMap[typeof type]>
  >(`/deductions/gov-rates/${contributionId}`, {
    contributionId, // ✅ include this explicitly in body
    type,
    ...data,
  });

    console.log("✅ Backend response:", response);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with a status outside 2xx
      console.error("❌ Backend error response:", error.response.data);
      console.error("❌ Status:", error.response.status);
      console.error("❌ Headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.error("❌ No response received:", error.request);
    } else {
      // Other errors
      console.error("❌ Error setting up request:", error.message);
    }
    throw error; // rethrow so caller still catches it
  }
};



