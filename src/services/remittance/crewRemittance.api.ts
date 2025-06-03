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
  RemittanceDetailID: number;
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
    const response = await axiosInstance.get<AllotteeResponse>(`/crew/${crewCode}/allottee`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export interface AddCrewRemittanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EditRemittanceStatusData {
  Status: string;
}

export interface EditRemittanceStatusResponse {
  success: boolean;
  message: string;
  data?: {
    Status: string;
  };
}

export const editRemittanceStatus = async (
  remittanceId: number,
  statusData: EditRemittanceStatusData,
  crewCode: string
): Promise<EditRemittanceStatusResponse> => {
  try {
    const userID = 1;
    
    if (!remittanceId || remittanceId <= 0) {
      throw new Error("Invalid remittance detail ID");
    }
    
    if (!statusData.Status && statusData.Status !== "0") {
      throw new Error("Status is required");
    }
    
    if (!crewCode || crewCode.trim() === "") {
      throw new Error("Crew code is required");
    }
    
    const requestBody = {
      userID: userID,
      status: statusData.Status
    };
    
    const endpoint = `/remittance/${crewCode}/${remittanceId}`;
    
    const response = await axiosInstance.patch<EditRemittanceStatusResponse>(
      endpoint,
      requestBody
    );
    
    return response.data;
    
  } catch (error: any) {
    if (error.response?.data?.success === true) {
      return error.response.data as EditRemittanceStatusResponse;
    }
    
    throw error;
  }
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
    
    if (remittanceData.status === null || remittanceData.status === undefined) {
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
    
    return response.data;
    
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.success === true) {
      return error.response.data as AddCrewRemittanceResponse;
    }
    
    if (error.response?.data?.success === true) {
      return error.response.data as AddCrewRemittanceResponse;
    }
    
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
  remittanceHeaderId: number
): Promise<DeleteRemittanceResponse> => {
  try {
    const userID = 1;
    
    const validRemittanceId = Number(remittanceHeaderId);
    
    if (isNaN(validRemittanceId) || validRemittanceId <= 0) {
      throw new Error(`Invalid remittance ID: ${remittanceHeaderId}. Must be a positive number.`);
    }

    const endpoint = `/remittance/${crewCode}/${validRemittanceId}?userID=${userID}`;
    
    const response = await axiosInstance.delete<DeleteRemittanceResponse>(endpoint);
    
    return response.data;
    
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.success === true) {
      return error.response.data as DeleteRemittanceResponse;
    }
    
    if (error.response?.data?.success === true) {
      return error.response.data as DeleteRemittanceResponse;
    }
    
    throw error;
  }
}