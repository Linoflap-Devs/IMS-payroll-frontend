export interface ICrewValidationDetails {
    Email: string;
    RegisterDate: Date;
    VerificationDate: Date | null;
    FirstName: string;
    MiddleName: string | null;
    LastName: string;
    ContactNumber: string;
    IsVerified: boolean;
    Documents: {
        IDType: string;
        IDNumber: string;
        IDIssueDate: Date;
        IDExpiryDate: Date | null;
        IDImages: {
            Filename: string;
            ContentType: string;
            FileExtension: string;
            FileContent: string;
        }[];
    }
}

export interface ICrewValidationResponse {
    success: boolean;
    message: string;
    data: ICrewValidationDetails | null;
}