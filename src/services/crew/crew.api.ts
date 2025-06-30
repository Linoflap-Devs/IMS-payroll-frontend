import axiosInstance from "../../lib/axios";

export interface CrewItem {
  CrewCode: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  RankID: number;
  Rank: string;
  CrewStatusID: number;
  AccountValidation: string | null;
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
  FirstName: string;
  MiddleName: string;
  LastName: string;
  MaritalStatus: string;
  Gender: string;
  Birthday: string;
  City: string;
  Province: string;
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
  Vessel: string;
  TransactionType: number;
  TransactionDate: string;
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
  PriorityAmount?: number;
  RelationID?: number;
  ProvinceID?: number;
  CityID?: number;
  BankID?: number;
  BankBranchID?: number;
}

export interface CrewAllotteeResponse {
  success: boolean;
  data: CrewAllottee[];
  message?: string;
}

export const getCrewAllottee = async (crewCode: string): Promise<CrewAllotteeResponse> => {
  const response = await axiosInstance.get<CrewAllotteeResponse>(`/crew/${crewCode}/allottee`);
  console.log('getCrewAllottee Response: ', response.data);
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
  rank: string; // Backend's Zod schema: z.coerce.number()
  vessel?: string; // Backend's Zod schema: z.optional(z.coerce.number())
  mobileNumber: string;
  landlineNumber?: string;
  emailAddress: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  sex: string; // Backend's Zod schema: z.string().min(1).max(6) (e.g., "Male", "Female", or string "0", "1")
  maritalStatus: string; // Backend's Zod schema: z.optional(z.coerce.number())
  dateOfBirth: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  city: string; // Backend's Zod schema: z.string().min(2).max(50)
  province: string; // Backend's Zod schema: z.string().min(2).max(50)
  sssNumber: string;
  tinNumber: string;
  philhealthNumber: string;
  hdmfNumber: string;
  passportNumber: string;
  passportIssueDate: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  passportExpiryDate: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  seamanBookNumber: string;
  seamanBookIssueDate: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  seamanBookExpiryDate: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  crewPhoto?: File; // Optional file upload
}

export interface UpdateCrewDataForm {
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
  dateOfBirth?: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  city?: string; // Backend's Zod schema: z.string().min(2).max(50)
  province?: string; // Backend's Zod schema: z.string().min(2).max(50)
  sssNumber?: string;
  tinNumber?: string;
  philhealthNumber?: string;
  hdmfNumber?: string;
  passportNumber?: string;
  passportIssueDate?: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  passportExpiryDate?: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  seamanBookNumber?: string;
  seamanBookIssueDate?: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  seamanBookExpiryDate?: string; // ISO format string e.g., "YYYY-MM-DD". Backend's Zod schema: z.coerce.date()
  crewPhoto?: File; // Optional file upload
}

export interface AddCrewSuccessData {
  CrewID: number;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
}

export interface AddCrewResponse {
  success: boolean;
  message: string;
  data?: AddCrewSuccessData | []; // any[] to accommodate `data: []` in error responses from controller
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

  // The endpoint from Insomnia was /crew/
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

export const updateCrew = async (crewCode: string, crewData: UpdateCrewDataForm): Promise<AddCrewResponse> => {
  const response = await axiosInstance.patch<AddCrewResponse>(`/crew/${crewCode}`, crewData);
  return response.data;
}