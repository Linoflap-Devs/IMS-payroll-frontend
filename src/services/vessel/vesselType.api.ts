import axiosInstance from "@/src/lib/axios";

export interface VesselTypeItem {
  VesselTypeId: number;
  VesselTypeCode: string;
  VesselTypeName: string;
}

export interface VesselTypeResponse {
  success: boolean;
  data: VesselTypeItem[];
  message?: string;
}
export const getVesselTypeList = async (): Promise<VesselTypeResponse> => {
  const response = await axiosInstance.get<VesselTypeResponse>("/vessels/type");
  return response.data;
}