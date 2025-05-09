// In: ../../src/services/wages/salaryScale.api.ts
import axiosInstance from "../../lib/axios";

// ... (other interfaces like SalaryScaleItem, UpdateSalaryScalePayload, UpdateSalaryScaleResponse remain the same) ...

export interface SalaryScaleItem {
  SalaryScaleDetailID: number;
  SalaryScaleHeaderID: number;
  RankID: number;
  WageID: number;
  Rank: string;
  WageAmount: number;
  Wage: string;
  VesselTypeId: number;
  VesselTypeName: string;
}

export interface SalaryScaleListResponse {
  success: boolean;
  data: SalaryScaleItem[];
  message?: string;
}

export interface UpdateSalaryScalePayload {
  wageRank: number;
  wageType: number;
  wageAmount: number;
}

export interface UpdateSalaryScaleResponse {
  success: boolean;
  data: SalaryScaleItem;
  message?: string;
}

export const getSalaryScaleList = async (): Promise<SalaryScaleListResponse> => {
  const response = await axiosInstance.get<SalaryScaleListResponse>("/wages/scale");
  return response.data;
};

/**
 * Updates an existing salary scale item.
 * @param scaleId The ID of the salary scale detail to update (SalaryScaleDetailID).
 * @param payload The data to update the salary scale with.
 * @returns The API response containing the updated salary scale item.
 */
export const updateSalaryScale = async (
  scaleId: number,
  payload: UpdateSalaryScalePayload
): Promise<UpdateSalaryScaleResponse> => {
  const apiUrl = `/wages/scale/${scaleId}`;
  // console.log("Attempting to PATCH to URL:", apiUrl); // Keep for debugging if needed
  // console.log("With scaleId:", scaleId);
  // console.log("With payload:", payload);

  // Change .put to .patch
  const response = await axiosInstance.patch<UpdateSalaryScaleResponse>(
    apiUrl,
    payload
  );
  return response.data;
};