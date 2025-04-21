import axiosInstance from "@/src/lib/axios";

export interface VesselPrincipalItem {
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