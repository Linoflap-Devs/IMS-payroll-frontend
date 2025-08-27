import axiosInstance from "@/src/lib/axios";
import { AllotteeApiModel, IAddAllottee, CrewAllotteeResponse } from "@/types/crewAllottee";

export const updateCrewAllottee = async (
  crewCode: string,
  allottee: AllotteeApiModel
): Promise<CrewAllotteeResponse> => {
  try {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee/${allottee.allotteeDetailId}`,
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
  try {
    const response = await axiosInstance.post<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee`,
      allottee
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCrewAllottee = async (crewCode: string, allotteeId: string): Promise<CrewAllotteeResponse> => {
    const response = await axiosInstance.delete<CrewAllotteeResponse>(`crew/${crewCode}/allottee/${allotteeId}`);
    return response.data;
}

interface BatchAllotteePayload {
  edit: AllotteeApiModel[];
  create: AllotteeApiModel[];
}

export const updateBatchAllottee = async (
  crewCode: string,
  allottees: BatchAllotteePayload
): Promise<CrewAllotteeResponse> => {
  try {
    const response = await axiosInstance.patch<CrewAllotteeResponse>(
      `crew/${crewCode}/allottee/`,
      allottees
    );

    //console.log("API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating allottees:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};
