export interface NewVesselItem {
    VesselID: number;
    VesselCode: string;
    VesselName: string;
    VesselType: string;
    Principal: string;
    PrincipalCode: string;
    IsActive: number;
}

export interface UpdatedVesselFromApi {
    VesselID: number;
    VesselCode: string
    VesselName: string;
    VesselType: string;
    Principal: string;
    IsActive: number;
}