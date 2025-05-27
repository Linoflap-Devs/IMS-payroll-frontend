import axiosInstance from "@/src/lib/axios"

export interface IRelationship {
    RelationshipID: string | number;
    RelationshipCode: string;
    RelationshipName: string;
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