import axiosInstance from "@/src/lib/axios";

export interface VesselItem {
  VesselID: number;
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
  IsActive: number;
  PrincipalCode: string;
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

export interface UpdateVesselPayload {
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
  RankID: any;
  CrewID: number;
  CrewCode: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Rank: string;
  Status: number;
  Country: string;
  SignOnDate?: Date;
}

export interface VesselCrewResponse {
  success: boolean;
  message: string;
  data: {
    VesselInfo: VesselInfoItem;
    Crew: CrewMember[];
  };
}

export interface OnboardCrewReportResponse {
  success: boolean;
  message: string;
  data: {
    VesselID: number,
    VesselName: string ,
    Crew: {
      FirstName: string,
      MiddleName: string | null,
      LastName: string,
      SeamansBook: string | null,
      Birthday: Date,
      JoinDate: Date,
      Rank: string,
      RSequence: number
    }[]
  }[]
}

export const getVesselCrew = async (vesselId: string | number): Promise<VesselCrewResponse> => {
  const response = await axiosInstance.get<VesselCrewResponse>(`/vessels/${vesselId}/crew`);
  return response.data;
};

export const getOnboardCrewReport = async (month: number, year: number, vesselId?: number): Promise<OnboardCrewReportResponse> => {
  if (vesselId) {
    const response = await axiosInstance.get(`/vessels/${vesselId}/onboard-crew/${year}/${month}`)
    return response.data
  }
  else {
    const response = await axiosInstance.get(`/vessels/onboard-crew/${year}/${month}`)
    return response.data
  }
}