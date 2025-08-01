import axiosInstance from "@/src/lib/axios";

export interface IOnBoardCrew {
    MovementDetailID: number;
    Rank: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Promotion: number;
    TransactionDate: Date;
    Port: string;
}

export interface VesselCrewResponse {
    success: boolean;
    message: string;
    data: IOnBoardCrew
}

export const addCrewToVessel = async (crewCode: string, vesselId: number, portId: number | undefined, rankId: number, dateOnBoard: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/sign-on`, {
        rankId: rankId,
        portId: portId,
        dateOnBoard: dateOnBoard
    })
    return response.data
}

interface CrewSignOnPayload {
  crewId: number;
  rankId: number;
}

export const batchAddCrewToVessel = async (
  vesselId: number,
  portId: number | undefined,
  signOnDate: Date,
  crew: CrewSignOnPayload[]
): Promise<VesselCrewResponse> => {
  const payload = {
    portId,
    signOnDate,
    crew,
  };

  console.log("Sending batch sign-on request to /vessels/:id/sign-on");
  console.log("Vessel ID:", vesselId);
  console.log("Port ID:", portId);
  console.log("Sign-On Date:", signOnDate);
  console.log("Crew:", crew);

  try {
    const response = await axiosInstance.post<VesselCrewResponse>(
      `/vessels/${vesselId}/sign-on`,
      payload
    );

    console.log("Server response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error during batch crew sign-on:", error?.response || error);
    throw error;
  }
};

export const repatriateCrew = async (crewCode: string, vesselId: number, portId: number, signOffDate: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/sign-off`, {
        portId: portId,
        signOffDate: signOffDate
    })
    return response.data
}

export const batchRepatriateCrew = async (
  vesselId: number,
  portId: number,
  signOffDate: Date,
  crewId: number
): Promise<VesselCrewResponse> => {
  console.log('Preparing to send sign-off request with the following data:');
  console.log('Vessel ID:', vesselId);
  console.log('Port ID:', portId);
  console.log('Sign-Off Date:', signOffDate);
  console.log('Crew ID:', crewId);

  try {
    const response = await axiosInstance.post<VesselCrewResponse>(
      `/vessels/${vesselId}/sign-off`,
      {
        portId: portId,
        signOffDate: signOffDate,
        crewId: crewId,
      }
    );

    console.log('Sign-off request successful. Response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error during crew sign-off:', error?.response || error);
    throw error;
  }
};

export const promoteCrew = async (crewCode: string, vesselId: number, rankId: number, promotionDate: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/promote`, {
        rankId: rankId,
        promotionDate: promotionDate
    })
    return response.data
}