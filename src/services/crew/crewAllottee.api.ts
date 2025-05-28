import axiosInstance from "@/src/lib/axios";
import { AllotteeApiModel, CrewAllotteeResponse } from "@/types/crewAllottee";

export const updateCrewAllottee = async (crewCode: string, allottee: AllotteeApiModel): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allottee.allotteeDetailID}`, allottee);
    return response.data;
}