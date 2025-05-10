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
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Rank: string;
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

export const getApplications = async (): Promise<ApplicationResponse> => {
    const response = await axiosInstance.get<ApplicationResponse>('/application/');
    return response.data;
};


