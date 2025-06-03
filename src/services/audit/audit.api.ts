import axiosInstance from "@/src/lib/axios";

export interface AuditLogEntry {
  AuditLogID: number;
  UserID: number;
  UserName: string;
  ActionType: string;
  TableName: string;
  RecordName: string;
  RecordID: number;
  TargetTableName?: string | null;
  TargetRecordID?: number | null;
  TargetName?: string | null;
  ModuleName?: string | null;
  CreatedAt: Date;
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  data: AuditLogEntry[];
}

export interface AuditLogFilters {
  UserID?: number;
  ActionType?: string;
  ModuleName?: string;
  startDate?: string;
  endDate?: string;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLogResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.UserID) params.append('UserID', filters.UserID.toString());
    if (filters?.ActionType) params.append('ActionType', filters.ActionType);
    if (filters?.ModuleName) params.append('ModuleName', filters.ModuleName);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `/audit?${queryString}` : '/audit';
    
    const response = await axiosInstance.get<AuditLogResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('Audit API Error:', error);
    throw error;
  }
};

export const createAuditLog = async (entry: Omit<AuditLogEntry, 'AuditLogID' | 'CreatedAt'>): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.post<{ success: boolean; message?: string }>('/audit', entry);
    return response.data;
  } catch (error: any) {
    console.error('Create Audit Log Error:', error);
    throw error;
  }
};