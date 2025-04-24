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


export interface AddVesselPayload {
  vesselCode: string;
  vesselName: string;
  vesselType: number;
  vesselPrincipal: number;
}

export interface AddVesselResponse {
  success: boolean;
  data: VesselItem;
  message?: string;
}

export const addVessel = async (payload: AddVesselPayload): Promise<AddVesselResponse> => {
  const response = await axiosInstance.post<AddVesselResponse>("/vessels", payload);
  return response.data;
};