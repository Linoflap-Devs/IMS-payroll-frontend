import axiosInstance from "@/src/lib/axios";

export interface VesselItem {
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
  IsActive: number;
}

export interface CreateVesselDto {
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
}

export interface VesselResponse {
  success: boolean;
  data: VesselItem[];
  message?: string;
}

export interface CreateVesselResponse {
  success: boolean;
  data: {
    VesselID: number;
    VesselCode: string;
    VesselName: string;
    VesselType: string;
    Principal: string;
  };
  message?: string;
}

export const getVesselList = async (): Promise<VesselResponse> => {
  const response = await axiosInstance.get<VesselResponse>("/vessels");
  return response.data;
};

export const addVessel = async (vessel: CreateVesselDto): Promise<CreateVesselResponse> => {
  const response = await axiosInstance.post<CreateVesselResponse>("/vessels", vessel);
  return response.data;
};