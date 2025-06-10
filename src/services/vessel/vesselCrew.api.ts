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


export const addCrewToVessel = async (crewCode: string, vesselId: number, portId: number, rankId: number, dateOnBoard: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/sign-on`, {
        rankId: rankId,
        portId: portId,
        dateOnBoard: dateOnBoard
    })
    return response.data
}