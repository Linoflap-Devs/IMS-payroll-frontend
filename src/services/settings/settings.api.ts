import axiosInstance from "@/src/lib/axios"

interface ImageItem {
    ImageId?: number;
    ImageType?: number;
    FileSize?: number;
    FileExtension?: string;
    ContentType?: string;
    Filename?: string; 
    FileContent?: string;
}

export interface SettingsItem {
    ConfigurationKey: string;
    ConfigurationValue: string;
    ImageDetails?: ImageItem[];
}


interface SettingsConfigResponse {
    success: boolean;
    data: SettingsItem[];
    message: string;
}

export const getSettingsConfig = async (): Promise<SettingsConfigResponse> => {
    const response = await axiosInstance.get<SettingsConfigResponse>("/config");
    return response.data;
}