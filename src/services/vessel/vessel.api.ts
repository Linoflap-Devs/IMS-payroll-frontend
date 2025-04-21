import axiosInstance from "@/src/lib/axios";

export interface VesselItem {
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
  IsActive: number;
}

export interface VesselResponse {
  success: boolean;
  data: VesselItem[];
  message?: string;
}

export const getVesselList = async (): Promise<VesselResponse> => {
  const response = await axiosInstance.get<VesselResponse>("/vessels");
  return response.data;
};