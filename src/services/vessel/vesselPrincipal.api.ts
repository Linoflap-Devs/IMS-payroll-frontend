import axiosInstance from "@/src/lib/axios";

export interface VesselPrincipalItem {
  PrincipalID: number;
  PrincipalName: string;
  PrincipalCode: string;
}

export interface VesselPrincipalResponse {
  success: boolean;
  data: VesselPrincipalItem[];
  message?: string;
}
export const getVesselPrincipalList = async (): Promise<VesselPrincipalResponse> => {
  const response = await axiosInstance.get<VesselPrincipalResponse>("/vessels/principal");
  return response.data;
}

interface AddVesselPrincipalPayload {
  principalCode: string;
  principalName: string;
}
export const addVesselPrincipal = async (payload: AddVesselPrincipalPayload): Promise<VesselPrincipalResponse> => {
  const response = await axiosInstance.post<VesselPrincipalResponse>("/vessels/principal", payload);
  return response.data;
}