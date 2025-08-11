import axiosInstance from "@/src/lib/axios";

export interface PaymentReferenceItem {
  PaymentReferenceID: number;
  PaymentReferenceNumber: string;
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

export interface AddPaymentReferencePayload {
  payMonth: number;
  payYear: number;
  deductionType: string;
  amount: number;
  referenceNumber: string;
}

export const addPaymentReference = async (payload: AddPaymentReferencePayload): Promise<PaymentReferencesResponse> => {
  const response = await axiosInstance.post<PaymentReferencesResponse>("/payment-references", payload);
  return response.data;
};

export interface UpdatePaymentReferencePayload {
  paymentReferenceId: number;
  payMonth: number;
  payYear: number;
  deductionType: string;
  amount: number;
  referenceNumber: string;
}

export const updatedPaymentReference = async (payload: UpdatePaymentReferencePayload): Promise<PaymentReferencesResponse> => {
  const response = await axiosInstance.patch<PaymentReferencesResponse>(`/payment-references/${payload.paymentReferenceId}`, {
    payMonth: payload.payMonth,
    payYear: payload.payYear,
    deductionType: payload.deductionType,
    amount: payload.amount,
    referenceNumber: payload.referenceNumber,
  });
  return response.data;
};