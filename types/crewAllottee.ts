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
    priority: boolean;
    isActive: number;
    receivePayslip: number;
    isDollar: number;
    allotteeDetailID?: string;
}

export interface AllotteeUiModel {
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
    active: boolean;
    priorityAmount: boolean;
    dollarAllotment: boolean;
    isDollar: number;
    allotmentType: number;
    allotteeDetailID: string;
}

export interface CrewAllotteeResponse {
    success: boolean;
    message: string;
    data: AllotteeApiModel[];
}