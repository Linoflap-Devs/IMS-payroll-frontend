import axiosInstance from "@/src/lib/axios";
import { ICrewValidationResponse } from "@/types/crewValidation";

export const getCrewValidationDetails = async (crewId: string): Promise<ICrewValidationResponse> => {
    const response = await axiosInstance.get<ICrewValidationResponse>(`crew/${crewId}/validation`);
    return response.data;
}

export const verifyCrew = async (crewId: string): Promise<ICrewValidationResponse> => {
    const response = await axiosInstance.patch<ICrewValidationResponse>(`crew/${crewId}/validation`);
    return response.data;
}

export const declineCrew = async (crewId: string): Promise<ICrewValidationResponse> => {
    const response = await axiosInstance.patch<ICrewValidationResponse>(`crew/${crewId}/validation/decline`);
    return response.data;
}