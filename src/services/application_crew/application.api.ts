import axiosInstance from "@/src/lib/axios";

interface RequestData {
    AllotteeRequestID: number;
    ApplicationRequestID: number;
    TargetID: number | null;
    AllotteeName: string;
    RelationID: number;
    Relation: string;
    ContactNumber: string;
    Address: string;
    CityID: number;
    City: string;
    ProvinceID: number;
    Province: string;
    BankID: number;
    Bank: string;
    BankBranchID: number;
    BankBranch: string;
    AccountNumber: string;
    Allotment: number;
}

interface Application {
    ApplicationRequestID: number;
    CrewCode: string;
    CreatedAt: Date;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Rank: string;
    ProcessedAt: Date;
    ApplicationStatus: string;
    ApplicationType: string;
    ApplicationOperation: string;
    RequestData: RequestData;
}

interface ApplicationResponse {
    success: boolean;
    message: string;
    data: Application[];
}

export interface ProcessApplicationResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export const getApplications = async (): Promise<ApplicationResponse> => {
    const response = await axiosInstance.get<ApplicationResponse>('/application/');
    return response.data;
};

export const processApplication = async (applicationRequestId: number, status: number): Promise<ProcessApplicationResponse> => {
    const response = await axiosInstance.patch<ProcessApplicationResponse>(`/application/${applicationRequestId}/process`, {
        status
    });
    return response.data;
};


