import axiosInstance from "@/src/lib/axios";
import { AllotteeApiModel, IAddAllottee, CrewAllotteeResponse } from "@/types/crewAllottee";

export const updateCrewAllottee = async (
  crewCode: string,
  allottee: AllotteeApiModel
): Promise<CrewAllotteeResponse> => {
  try {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee/${allottee.allotteeDetailID}`,
      allottee
    );

    return response.data;
  } catch (error) {
    console.error("Error updating crew allottee:", error);
    throw error;
  }
};

export const addCrewAllottee = async (
  crewCode: string,
  allottee: IAddAllottee
): Promise<CrewAllotteeResponse> => {
  console.log("[addCrewAllottee] Starting request...");
  console.log("[addCrewAllottee] Crew Code:", crewCode);
  console.log("[addCrewAllottee] Allottee Payload:", allottee);

  try {
    const response = await axiosInstance.post<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee`,
      allottee
    );

    console.log("[addCrewAllottee] HTTP Status:", response.status);
    console.log("[addCrewAllottee] Full Response:", response);
    console.log("[addCrewAllottee] Response Data:", response.data);

    return response.data;
  } catch (error) {
    console.error("[addCrewAllottee] Error occurred:", error);
    throw error;
  }
};

export const deleteCrewAllottee = async (crewCode: string, allotteeId: string): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.delete<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allotteeId}`);
    return response.data;
}