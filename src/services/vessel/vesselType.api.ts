import axiosInstance from "@/src/lib/axios";

export interface VesselTypeItem {
  VesselTypeID: number;
  VesselTypeCode: string;
  VesselTypeName: string;
}

export interface VesselTypeResponse {
  success: boolean;
  data: VesselTypeItem[] | VesselTypeItem;
  message?: string;
}

export const getVesselTypeList = async (): Promise<VesselTypeResponse> => {
  const response = await axiosInstance.get<VesselTypeResponse>("/vessels/type");
  return response.data;
}

interface AddVesselTypePayload {
  vesselTypeCode: string;
  vesselTypeName: string;
}

export const addVesselType = async (payload: AddVesselTypePayload): Promise<VesselTypeResponse> => {
  const response = await axiosInstance.post<VesselTypeResponse>("/vessels/type", payload);
  return response.data;
}

export interface UpdateVesselTypePayload {
  vesselTypeID: number;
  vesselTypeCode: string;
  vesselTypeName: string;
  isActive: number;
}

export const updateVesselType = async (payload: UpdateVesselTypePayload): Promise<VesselTypeResponse> => {
  const response = await axiosInstance.patch<VesselTypeResponse>(`/vessels/type/${payload.vesselTypeID}`, {
    vesselTypeCode: payload.vesselTypeCode,
    vesselTypeName: payload.vesselTypeName,
    isActive: payload.isActive
  });
  return response.data;
}
export interface DeleteVesselTypeResponse {
  success: boolean;
  message?: string;
}
export const deleteVesselType = async (vesselTypeID: number): Promise<VesselTypeResponse> => {
  const response = await axiosInstance.delete<VesselTypeResponse>(`/vessels/type/${vesselTypeID}`);
  return response.data;
}