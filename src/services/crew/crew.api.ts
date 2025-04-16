
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
