import axiosInstance from "@/src/lib/axios";

export interface IPort {
    PortID: number;
    PortCode: string;
    PortName: string;
    CountryID: number;
}

export interface PortResponse {
    success: boolean;
    data: IPort[];
    message?: string;
}
export const getPortList = async (): Promise<PortResponse> => {
    const response = await axiosInstance.get<PortResponse>("/locations/ports");
    return response.data;
}