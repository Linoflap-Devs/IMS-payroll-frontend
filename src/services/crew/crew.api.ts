import axiosInstance from "../../lib/axios";

export interface CrewItem {
  HDMFNumber: string | null;
  PhilHealthNumber: string | null;
  TaxIDNumber: string | null;
  SSSNumber: string | null;
  CrewID?: number;
  CrewCode: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  RankID: number;
  Rank: string;
  CrewStatusID: number;
  AccountValidation: number | null;
  IsActive: number;
}

export interface CrewResponse {
  success: boolean;
  data: CrewItem[];
  message?: string;
}

export const getCrewList = async (): Promise<CrewResponse> => {
  const response = await axiosInstance.get<CrewResponse>("/crew");
  return response.data;
};

export interface CrewDetails {
  crewPhoto: any;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  MaritalStatus: string;
  Gender: string;
  Birthday: string;
  City: string;
  Province: string;
  HomeAddress: string;
  SSSNumber: string;
  HDMFNumber: string;
  TaxIDNumber: string;
  PassportNumber: string;
  PassPortIssueDate: string;
  PassPortExpiredDate: string;
  PhilhealthNumber: string;
  SRIBNumber: string;
  SRIBIssueDate: string;
  SRIBExpiredDate: string;
  ProfileImage?: {
    FileContent: string;
    FileExtension: string;
    ContentType: string;
  }
}

export interface CrewDetailsResponse {
  success: boolean;
  data: CrewDetails;
  message?: string;
}

export const getCrewDetails = async (crewCode: string): Promise<CrewDetailsResponse> => {
  const response = await axiosInstance.get<CrewDetailsResponse>(`/crew/${crewCode}/details`);
  return response.data;
};

export interface CrewBasic {
  Vessel?: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Rank: string;
  CrewStatusID: number;
  CrewCode: string;
  Birthday: string;
  MobileNo: string;
  LandLineNo: string;
  EmailAddress: string;
  ProfileImage?: {
    FileContent: string;
    FileExtension: string;
    ContentType: string;
  };
}

export interface CrewBasicResponse {
  success: boolean;
  data: CrewBasic;
  message?: string;
}

export const getCrewBasic = async (crewCode: string): Promise<CrewBasicResponse> => {
  const response = await axiosInstance.get<CrewBasicResponse>(`/crew/${crewCode}`);
  return response.data;
}

export interface CrewMovement {
  VesselID?: number;
  MovementDetailID: number;
  Vessel: string;
  SignOnDate?: Date;
  SignOffDate?: Date;
  Rank: string;
}

export interface CrewMovementResponse {
  success: boolean;
  data: CrewMovement[];
  message?: string;
}
// export const getCrewMovement = async (crewCode: string): Promise<CrewMovementResponse> => {
//   const response = await axiosInstance.get<CrewMovementResponse>(`/crew/${crewCode}/movement`);
//   return response.data;
// }

export const getCrewMovementv2 = async (crewCode: string): Promise<CrewMovementResponse> => {
  const response = await axiosInstance.get<CrewMovementResponse>(`/v2/crew/${crewCode}/movement`);
  return response.data;
}

export interface CrewAllottee {
  active?: number;
  receivePayslip?: number;
  priority?: any;
  AllotteeId: number;
  AllotteeName: string;
  RelationName: string;
  ContactNumber: string;
  Address: string;
  CityName: string;
  ProvinceName: string;
  BankName: string;
  BankBranch: string;
  AccountNumber: string;
  Allotment: number;
  IsDollar: number;
  AllotmentType: number;
  AllotteeDetailID: string;
  IsActive?: number;
  //PriorityAmount?: number;
  RelationID?: number;
  ProvinceID?: number;
  CityID?: number;
  BankID?: number;
  BankBranchID?: number;
  Priority?: number;
}

export interface CrewAllotteeResponse {
  success: boolean;
  data: CrewAllottee[];
  message?: string;
}

export const getCrewAllottee = async (crewCode: string): Promise<CrewAllotteeResponse> => {
  const response = await axiosInstance.get<CrewAllotteeResponse>(`/crew/${crewCode}/allottee`);
  return response.data;
}

export interface CrewRankItem {
  RankID: number;
  RankCode: string;
  RankName: string;
  Rsequence: number;
}
export interface CrewRankResponse {
  success: boolean;
  data: CrewRankItem[];
  message?: string;
}
export const getCrewRankList = async (): Promise<CrewRankResponse> => {
  const response = await axiosInstance.get<CrewRankResponse>(`/ranks`);
  return response.data;
}

export interface AddCrewDataForm {
  crewCode: string;
  rank: string;
  vessel?: string;
  mobileNumber: string;
  landlineNumber?: string;
  emailAddress: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  sex: string;
  maritalStatus: string;
  dateOfBirth: string; 
  city: string;
  province: string;
  address: string;
  sssNumber?: string;
  tinNumber?: string;
  philhealthNumber?: string;
  hdmfNumber?: string;
  passportNumber: string;
  passportIssueDate: string; 
  passportExpiryDate: string; 
  seamanBookNumber: string;
  seamanBookIssueDate: string; 
  seamanBookExpiryDate: string; 
  crewPhoto?: File; // Optional file upload
}

export interface UpdateCrewDataForm {
  taxIdNumber: string | number | File | null | undefined;
  address: string | number | File | null | undefined;
  crewCode?: string;
  rank?: string; // Backend's Zod schema: z.coerce.number()
  vessel?: string; // Backend's Zod schema: z.optional(z.coerce.number())
  mobileNumber?: string;
  landlineNumber?: string;
  emailAddress?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  sex?: string; // Backend's Zod schema: z.string().min(1).max(6) (e.g., "Male", "Female", or string "0", "1")
  maritalStatus?: string; // Backend's Zod schema: z.optional(z.coerce.number())
  dateOfBirth?: string; 
  city?: string; // Backend's Zod schema: z.string().min(2).max(50)
  province?: string; // Backend's Zod schema: z.string().min(2).max(50)
  sssNumber?: string | null;
  tinNumber?: string | null;
  philhealthNumber?: string | null;
  hdmfNumber?: string | null;
  passportNumber?: string;
  passportIssueDate?: string; 
  passportExpiryDate?: string; 
  seamanBookNumber?: string;
  seamanBookIssueDate?: string; 
  seamanBookExpiryDate?: string;
  crewPhoto?: File;
}

export interface AddCrewSuccessData {
  CrewID: number;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
}

export interface UpdateCrewSuccessData {
  CrewID: number;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  crewPhoto: File | undefined;
}

export interface AddCrewResponse {
  success: boolean;
  message: string;
  data?: AddCrewSuccessData | [];
}

export interface UpdateCrewResponse {
  success: boolean;
  message: string;
  data?: UpdateCrewSuccessData | [];
}

export const addCrew = async (crewData: AddCrewDataForm): Promise<AddCrewResponse> => {
  const formData = new FormData();

  // Helper to safely append to FormData, handling undefined values
  const appendIfExists = (key: string, value: string | number | File | undefined | null) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  };

  appendIfExists("crewCode", crewData.crewCode);
  appendIfExists("rank", crewData.rank);
  appendIfExists("vessel", crewData.vessel);
  appendIfExists("mobileNumber", crewData.mobileNumber);
  appendIfExists("landlineNumber", crewData.landlineNumber);
  appendIfExists("emailAddress", crewData.emailAddress);
  appendIfExists("lastName", crewData.lastName);
  appendIfExists("firstName", crewData.firstName);
  appendIfExists("middleName", crewData.middleName);
  appendIfExists("sex", crewData.sex);
  appendIfExists("maritalStatus", crewData.maritalStatus);
  appendIfExists("dateOfBirth", crewData.dateOfBirth);
  appendIfExists("city", crewData.city);
  appendIfExists("province", crewData.province);
  appendIfExists("address", crewData.address)
  appendIfExists("sssNumber", crewData.sssNumber);
  appendIfExists("tinNumber", crewData.tinNumber);
  appendIfExists("philhealthNumber", crewData.philhealthNumber);
  appendIfExists("hdmfNumber", crewData.hdmfNumber);
  appendIfExists("passportNumber", crewData.passportNumber);
  appendIfExists("passportIssueDate", crewData.passportIssueDate);
  appendIfExists("passportExpiryDate", crewData.passportExpiryDate);
  appendIfExists("seamanBookNumber", crewData.seamanBookNumber);
  appendIfExists("seamanBookIssueDate", crewData.seamanBookIssueDate);
  appendIfExists("seamanBookExpiryDate", crewData.seamanBookExpiryDate);

  if (crewData.crewPhoto) {
    formData.append("crewPhoto", crewData.crewPhoto);
  }

  // Axios automatically sets 'Content-Type': 'multipart/form-data' when FormData is used.
  const response = await axiosInstance.post<AddCrewResponse>("/crew/", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const deleteCrew = async (crewCode: string): Promise<AddCrewResponse> => {
  const response = await axiosInstance.delete<AddCrewResponse>(`/crew/${crewCode}`);
  return response.data;
}

export const reactivateCrew = async (crewCode: string): Promise<AddCrewResponse> => {
  const response = await axiosInstance.patch<AddCrewResponse>(
    `/crew/reactivate`,
    { crewCode }
  );
  return response.data;
}

export const updateCrew = async (
  crewCode: string,
  crewData: Partial<UpdateCrewDataForm>
): Promise<UpdateCrewResponse> => {
  const formData = new FormData();

  const appendIfExists = (
    key: string,
    value: string | number | File | undefined | null
  ) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  };

  //appendIfExists("status", crewData.status);
  appendIfExists("emailAddress", crewData.emailAddress);
  appendIfExists("mobileNumber", crewData.mobileNumber);
  appendIfExists("landlineNumber", crewData.landlineNumber);
  appendIfExists("firstName", crewData.firstName);
  appendIfExists("lastName", crewData.lastName);
  appendIfExists("middleName", crewData.middleName);
  appendIfExists("maritalStatus", crewData.maritalStatus);
  appendIfExists("sex", crewData.sex);
  appendIfExists("dateOfBirth", crewData.dateOfBirth);
  appendIfExists("city", crewData.city);
  appendIfExists("province", crewData.province);
  appendIfExists("address", crewData.address);
  appendIfExists("sssNumber", crewData.sssNumber);
  appendIfExists("philhealthNumber", crewData.philhealthNumber);
  appendIfExists("taxIdNumber", crewData.taxIdNumber);
  appendIfExists("hdmfNumber", crewData.hdmfNumber);
  appendIfExists("passportNumber", crewData.passportNumber);
  appendIfExists("passportIssueDate", crewData.passportIssueDate);
  appendIfExists("passportExpiryDate", crewData.passportExpiryDate);
  appendIfExists("seamanBookNumber", crewData.seamanBookNumber);
  appendIfExists("seamanBookIssueDate", crewData.seamanBookIssueDate);
  appendIfExists("seamanBookExpiryDate", crewData.seamanBookExpiryDate);

  if (crewData.crewPhoto) {
    formData.append("crewPhoto", crewData.crewPhoto);
  }

  const response = await axiosInstance.patch<UpdateCrewResponse>(
    `/crew/${crewCode}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export interface Movement {
  VesselName: string;
  Rank: string;
  OnboardDate: Date | null;
  OffboardDate: Date | null;
  Promotion: number;
  Remarks: string | null;
}
export interface CrewMovementHistory {
  MovementDetailID: number;
  Status: any;
  CrewID: number;
  CrewCode: string;
  FirstName: string;
  MiddleName: string | null;
  LastName: string;
  Rank: string;
  Movements: Movement[];
}

interface CrewMovementHistoryResponse {
  success: boolean;
  data: CrewMovementHistory[];
  message?: string;
}

export const getCrewMovementHistory = async (crewCode?: string): Promise<CrewMovementHistoryResponse> => {
  if (!crewCode) {
    const response = await axiosInstance.get<CrewMovementHistoryResponse>(`/movements/movement-report`);
    return response.data;
  }
  else {
    const response = await axiosInstance.get<CrewMovementHistoryResponse>(`/movements/${crewCode}/movement-report`);
    return response.data;
  }
}

export interface UpdateCrewMovementPayload {
  RankID?: number;
  signOnDate: Date;
  signOffDate: Date;
  rankId: number;
  vesselId: number;
}

interface UpdateMovementResponse {
  success: boolean;
  data: UpdateCrewMovementPayload[];
  message?: string
}

export const updateCrewMovement = async (crewCode: string, movementId: number, payload: UpdateCrewMovementPayload): Promise<UpdateMovementResponse> => {
  const response = await axiosInstance.patch<UpdateMovementResponse>(`/movements/${crewCode}/id/${movementId}`, payload);
  return response.data;
}

export const deleteMovement = async (crewCode: string, movementId: number): Promise<CrewMovementResponse> => {
  const response = await axiosInstance.delete<CrewMovementResponse>(`/movements/${crewCode}/id/${movementId}`);
  return response.data;
}

