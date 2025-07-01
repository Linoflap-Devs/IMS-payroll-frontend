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
  active: number;
  allotteeDetailID?: string;
  receivePayslip?: number;
}

export interface AllotteeUiModel {
  priority?: number;
  id: string;
  name: string;
  relationship: string;
  relationshipId: string;
  contactNumber: string;
  address: string;
  city: string;
  cityId: string;
  province: string;
  provinceId: string;
  bankName: string;
  bankId: string;
  bankBranch: string;
  branchId: string;
  accountNumber: string;
  allotment: number;
  active: number;
  priorityAmount?: boolean;
  dollarAllotment?: boolean;
  allotmentType: number;
  allotteeDetailID: string;

  receivePayslip?: number;
}

export interface IAddAllottee {
  active?: any;
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
  priority: boolean;
  isActive: number;
  receivePayslip: number;
}

export interface CrewAllotteeResponse {
  success: boolean;
  message: string;
  data: AllotteeApiModel[];
}
