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

export const repatriateCrew = async (crewCode: string, vesselId: number, portId: number, signOffDate: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/sign-off`, {
        portId: portId,
        signOffDate: signOffDate
    })
    return response.data
}

export const promoteCrew = async (crewCode: string, vesselId: number, rankId: number, promotionDate: Date): Promise<VesselCrewResponse> => {
    const response = await axiosInstance.post<VesselCrewResponse>(`/vessels/${vesselId}/crew/${crewCode}/promote`, {
        rankId: rankId,
        promotionDate: promotionDate
    })
    return response.data
}