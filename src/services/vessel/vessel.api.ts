import axiosInstance from "@/src/lib/axios";

export interface VesselItem {
  VesselID: number;
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

export interface UpdateVesselPayload{
  vesselID: number;
  vesselCode: string;
  vesselName: string;
  vesselType: number;
  vesselPrincipal: number;
  isActive: number;
}
export interface UpdateVesselResponse {
  success: boolean;
  data: VesselItem;
  message?: string;
}
export const updateVessel = async (payload: UpdateVesselPayload): Promise<UpdateVesselResponse> => {
  const response = await axiosInstance.patch<UpdateVesselResponse>(`/vessels/${payload.vesselID}`, {
    vesselCode: payload.vesselCode,
    vesselName: payload.vesselName,
    vesselType: payload.vesselType,
    vesselPrincipal: payload.vesselPrincipal,
    isActive: payload.isActive
  });
  return response.data;
};

export interface DeleteVesselResponse {
  success: boolean;
  message: string;
}
export const deleteVessel = async (vesselId: number): Promise<DeleteVesselResponse> => {
  const response = await axiosInstance.delete<DeleteVesselResponse>(`/vessels/${vesselId}`);
  return response.data;
};

export interface VesselInfoItem {
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
  Status: number;
}

export interface CrewMember {
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Status: number;
}

export interface VesselCrewResponse {
  success: boolean;
  message: string;
  data: {
    VesselInfo: VesselInfoItem;
    Crew: CrewMember[];
  };
}

export const getVesselCrew = async (vesselId: string | number): Promise<VesselCrewResponse> => {
  const response = await axiosInstance.get<VesselCrewResponse>(`/vessels/${vesselId}/crew`);
  return response.data;
};

