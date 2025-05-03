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
  MaritalStatus: number;
  Gender: number;
  Birthday: string;
  City: string;
  Province: string;
  SSSNumber: string;
  HDMFNumber: string;
  PassportNumber: string;
  PassPortIssueDate: string;
  PassPortExpiredDate: string;
  SRIBNumber: string;
  SRIBIssueDate: string;
  SRIBExpiredDate: string;
  
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

export interface CrewBasic{
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Rank: string;
  CrewStatusID: number;
  CrewCode: string;
  Birthday: string;
  MobileNo: string;
  LandlineNo: string;
  EmailAddress: string;
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
export const getCrewMovement = async (crewCode: string): Promise<CrewMovementResponse> => {
  const response = await axiosInstance.get<CrewMovementResponse>(`/crew/${crewCode}/movement`);
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


export interface CrewRankItem{
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


export interface AddCrewPayload{
 CrewCode: string;
 rank: number;
 mobileNumber: string;
 emailAddress: string;
 landlineNumber: string;
 lastName: string;
  firstName: string;
  middleName: string;
  sex: number;
  dateOfBirth: string;
  city: number;
  province: number;
  sssNumber: number;
  hdmfNumber: number;
  tinNumber: number;
  philhealthNumber: number;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  seamanBookNumber: string;
  seamanBookIssueDate: string;
  seamanBookExpiryDate: string;
  crewPhoto: string;

}

export interface AddCrewResponse {
  success: boolean;
  data: CrewItem;
  message?: string;
}
export const addCrew = async (payload: AddCrewPayload): Promise<AddCrewResponse> => {
  const response = await axiosInstance.post<AddCrewResponse>(`/crew`, payload);
  return response.data;
}
