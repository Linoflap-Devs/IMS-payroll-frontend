import axiosInstance from "../../lib/axios";

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
  EffectivedateFrom: string;
  EffectivedateTo: string;
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

// NEW ENDPOINT WITH YEAR
export const getWageScale = async (
  params?: {
    vesselTypeId?: number;
    rankId?: number;
    wageId?: number;
    year?: number;
  }
): Promise<SalaryScaleListResponse> => {
  const response = await axiosInstance.get<SalaryScaleListResponse>(
    "/wages/scale-v2",
    { params }
  );

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

  const response = await axiosInstance.patch<UpdateSalaryScaleResponse>(
    apiUrl,
    payload
  );
  return response.data;
};