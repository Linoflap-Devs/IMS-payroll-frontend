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
  status: string;
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
  try {
    console.log("Fetching allottees for crew code:", crewCode);
    
    const response = await axiosInstance.get<AllotteeResponse>(`/crew/${crewCode}/allottee`);
    
    console.log("Allottees response:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching allottees:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    throw error;
  }
}

export interface AddCrewRemittanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const addCrewRemittance = async (
  crewCode: string, 
  remittanceData: AddCrewRemittanceData
): Promise<AddCrewRemittanceResponse> => {
  try {
    const userID = 1; 
    
    if (!remittanceData.allotteeID || remittanceData.allotteeID <= 0) {
      throw new Error("Invalid allotteeID");
    }
    
    if (!remittanceData.amount || remittanceData.amount <= 0) {
      throw new Error("Invalid amount");
    }
    
    if (!remittanceData.remarks || remittanceData.remarks.trim() === '') {
      throw new Error("Remarks is required");
    }
    
    if (remittanceData.status === null || remittanceData.status === undefined || 0) {
      throw new Error("Invalid status");
    }
    
    const requestBody = {
      userID: userID,
      crewCode: crewCode,
      allotteeID: remittanceData.allotteeID,
      amount: remittanceData.amount,
      remarks: remittanceData.remarks.trim(),
      status: remittanceData.status
    };
    
    
    const response = await axiosInstance.post<AddCrewRemittanceResponse>(
      `/remittance/${crewCode}`, 
      requestBody
    );
    
    console.log("Response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    throw error;
  }
}

export interface DeleteRemittanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const deleteCrewRemittance = async (
  crewCode: string,
  remittanceId: number
): Promise<DeleteRemittanceResponse> => {
  try {
    const userID = 1;
    
    const validRemittanceId = Number(remittanceId);
    
    if (isNaN(validRemittanceId) || validRemittanceId <= 0) {
      console.error("Invalid remittance ID received:", remittanceId);
      throw new Error(`Invalid remittance ID: ${remittanceId}. Must be a positive number.`);
    }
    
    console.log("Delete Request URL:", `/remittance/${crewCode}/${validRemittanceId}`);
    console.log("Delete Request Data:", { userID, crewCode, remittanceId: validRemittanceId });
    
    const response = await axiosInstance.delete<DeleteRemittanceResponse>(
      `/remittance/${crewCode}/${validRemittanceId}?userID=${userID}`
    );
    
    console.log("Delete Response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Delete API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    throw error;
  }
}