import axiosInstance from "@/src/lib/axios";

export interface PaymentReferenceItem {
    PaymentReferenceNumber: number;
    DeductionType: string;
    Amount: number;
    PayMonth: number;
    PayYear: number;
}

export interface PaymentReferencesResponse {
  success: boolean;
  data: PaymentReferenceItem[];
  message?: string;
}

export const getPaymentReferences = async (): Promise<PaymentReferencesResponse> => {
  const response = await axiosInstance.get<PaymentReferencesResponse>("/payment-references");
  return response.data; 
}