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

export interface UpdateVesselPrincipalPayload {
  principalID: number;
  principalCode: string;
  principalName: string;
  isActive: number;
}
export const updateVesselPrincipal = async (payload: UpdateVesselPrincipalPayload): Promise<VesselPrincipalResponse> => {
  const response = await axiosInstance.patch<VesselPrincipalResponse>(`/vessels/principal/${payload.principalID}`, {
    principalCode: payload.principalCode,
    principalName: payload.principalName,
    isActive: payload.isActive
  });
  return response.data;
}

export interface DeleteVesselPrincipalResponse {
  success: boolean;
  message: string;
}

export const deleteVesselPrincipal = async (principalId: number): Promise<DeleteVesselPrincipalResponse> => {
  const response = await axiosInstance.delete<DeleteVesselPrincipalResponse>(`/vessels/principal/${principalId}`);
  return response.data;
}