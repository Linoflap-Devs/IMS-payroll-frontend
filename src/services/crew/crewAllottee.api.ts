import axiosInstance from "@/src/lib/axios";
import { AllotteeApiModel, IAddAllottee, CrewAllotteeResponse } from "@/types/crewAllottee";

export const updateCrewAllottee = async (crewCode: string, allottee: AllotteeApiModel): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allottee.allotteeDetailID}`, allottee);
    return response.data;
}

export const addCrewAllottee = async (
  crewCode: string,
  allottee: IAddAllottee
): Promise<CrewAllotteeResponse> => {
  console.log("Sending request to add allottee:");
  console.log("Crew Code:", crewCode);
  console.log("Allottee Payload:", allottee);

  try {
    const response = await axiosInstance.post<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee`,
      allottee
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Request to add allottee failed:", error);
    throw error;
  }
};

export const deleteCrewAllottee = async (crewCode: string, allotteeId: string): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.delete<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allotteeId}`);
    return response.data;
}