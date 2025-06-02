import axiosInstance from "@/src/lib/axios";

export interface CrewRemittanceItem {
  CrewID: number;
  CrewCode: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Rank: string;
  RankID: number;
  Vessel: string;
}

export interface CrewRemittanceResponse {
  success: boolean;
  data: CrewRemittanceItem[];
  message?: string;
}

export const getCrewRemittanceList = async (): Promise<CrewRemittanceResponse> => {
  const response = await axiosInstance.get<CrewRemittanceResponse>("/remittance");
  return response.data;
}

export interface CrewRemittanceDetailItem {
  RemittanceHeaderID: number;
  RemittanceID: number;
  AllotteeID: number;
  AllotteeName: string;
  Amount: number;
  Remarks: string;
  Month: string;
  Year: number;
  Status: string;
}

export interface CrewRemittanceDetailResponse {
  success: boolean;
  data: CrewRemittanceDetailItem[];
  message?: string;
}

export const getCrewRemittanceDetails = async (crewCode: string): Promise<CrewRemittanceDetailResponse> => {
  const response = await axiosInstance.get<CrewRemittanceDetailResponse>(`/remittance/${crewCode}`);
  return response.data;
}

export interface AddCrewRemittanceData {
  allotteeID: number;
  amount: number;
  remarks: string;
  status: number;
}

export interface AllotteeOption {
  AllotteeHeaderId: number;
  AllotteeDetailID: number;
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
  AllotmentType: number;
  IsDollar: number;
}

export interface AllotteeResponse {
  success: boolean;
  message: string;
  data: AllotteeOption[];
}

export const getAllottees = async (crewCode: string): Promise<AllotteeResponse> => {
  const response = await axiosInstance.get<AllotteeResponse>(`/crew/${crewCode}/allottee`);
  return response.data;
}

export interface AddCrewRemittanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface DeleteRemittanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const addCrewRemittance = async (
  crewCode: string, 
  remittanceData: AddCrewRemittanceData
): Promise<AddCrewRemittanceResponse> => {
  try {
      const requestBody = {
      allotteeID: Number(remittanceData.allotteeID),
      amount: Number(remittanceData.amount),
      remarks: String(remittanceData.remarks),
      status: String(remittanceData.status)
    };
    
    console.log("Request URL:", `remittance/${crewCode}`);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    
    const response = await axiosInstance.post<AddCrewRemittanceResponse>(
      `remittance/${crewCode}`, 
      requestBody
    );
    
    console.log("Response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

export const deleteCrewRemittance = async (
  crewCode: string,
  remittanceId: number
): Promise<DeleteRemittanceResponse> => {
  try {
    const userID = 1;
    
    console.log("Delete Request URL:", `/api/remittance/${crewCode}/${remittanceId}`);
    console.log("Delete Request Data:", { userID, crewCode, remittanceId });
    
    const response = await axiosInstance.delete<DeleteRemittanceResponse>(
      `/api/remittance/${crewCode}/${remittanceId}?userID=${userID}`
    );
    
    console.log("Delete Response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Delete API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

