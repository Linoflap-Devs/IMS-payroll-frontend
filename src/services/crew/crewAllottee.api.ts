import axiosInstance from "@/src/lib/axios";
import { AllotteeApiModel, IAddAllottee, CrewAllotteeResponse } from "@/types/crewAllottee";

export const updateCrewAllottee = async (crewCode: string, allottee: AllotteeApiModel): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allottee.allotteeDetailID}`, allottee);
    return response.data;
}

export const addCrewAllottee = async (crewCode: string, allottee: IAddAllottee): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.post<CrewAllotteeResponse>(`crew/${crewCode}/allottee`, allottee);
    return response.data;
}

export const deleteCrewAllottee = async (crewCode: string, allotteeId: string): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.delete<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allotteeId}`);
    return response.data;
}