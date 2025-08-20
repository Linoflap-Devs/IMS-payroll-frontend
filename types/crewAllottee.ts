export interface AllotteeApiModel {
  id?: string;
  name: string;
  allotmentType: number;
  relation: number;
  contactNumber: string;
  address: string;
  city: number;
  province: number;
  bank: number;
  branch: number;
  accountNumber: string;
  allotment: number;
  priority: number;
  active?: number;
  allotteeDetailId?: string;
  receivePayslip?: number;
  Percentage?: number;
  isActive?: number;
}

export interface AllotteeUiModel {
  relation?: number;
  priority?: number;
  id: string;
  name: string;
  relationship: string;
  relationshipId: number;
  contactNumber: string;
  address: string;
  city?: string | number | undefined;
  cityId: string;
  province?: string | number | undefined;
  provinceId: string;
  bankName: string;
  bankId: string;
  bankBranch: string;
  
  branchId: string;
  accountNumber: string;
  allotment: number;
  active: number;
  priorityAmount?: number;
  dollarAllotment?: number;
  allotmentType: number;
  allotteeDetailID: string;
  receivePayslip?: number;
  Percentage?: number;
}

export interface IAddAllottee {
  active?: any;
  name: string;
  allotmentType: number;
  relation: number;
  contactNumber?: string;
  address?: string;
  city: number;
  province: number;
  bank: number;
  branch: number;
  accountNumber: string;
  allotment: number;
  priority: number;
  isActive: number;
  receivePayslip: number;
}

export interface CrewAllotteeData {
  Percentage: number;
  allottees: AllotteeApiModel[];
}

export interface CrewAllotteeResponse {
  success: boolean;
  message: string;
  data: CrewAllotteeData;
}

