import axiosInstance from "@/src/lib/axios";
import { ICrewValidationResponse } from "@/types/crewValidation";

export const getCrewValidationDetails = async (crewId: string): Promise<ICrewValidationResponse> => {
    const response = await axiosInstance.get<ICrewValidationResponse>(`crew/${crewId}/validation`);
    return response.data;
}

export const verifyCrew = async (crewId: string): Promise<ICrewValidationResponse> => {
    const response = await axiosInstance.post<ICrewValidationResponse>(`crew/${crewId}/validation`);
    return response.data;
}
