import axiosInstance from "@/src/lib/axios";

export interface BankItem {
    BankID: string | number;
    BankName: string;
    BankBranchID: string | number;
    BankBranchName: string;
}

export interface BankResponse {
    success: boolean;
    data: BankItem[];
    message?: string;
}

export const getBankList = async (): Promise<BankResponse> => {
    const response = await axiosInstance.get<BankResponse>("/bank");
    //console.log('BANK ITEM: ', response);
    return response.data;
}