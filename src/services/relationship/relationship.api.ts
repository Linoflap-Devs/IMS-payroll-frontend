import axiosInstance from "@/src/lib/axios"

export interface IRelationship {
    RelationID: string | number;
    RelationCode: string;
    RelationName: string;
}

interface IRelationshipResponse {
    success: boolean;
    data: IRelationship[];
    message: string;
}

export const getRelationshipList = async (): Promise<IRelationshipResponse> => {
    const response = await axiosInstance.get<IRelationshipResponse>("/relationships");
    return response.data;
}