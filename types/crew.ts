import { format } from "date-fns";

export type Allottee = {
  name: string;
  relationship: string;
  contactNumber: string;
  address: string;
  city: string;
  active: boolean;
  priorityAmount: boolean;
  dollarAllotment: boolean;
};

export interface Crew {
  TaxIDNumber?: string;
  tinNumber?: string;
  seamanBookNumber?: string;
  seamanBookIssueDate?: string;
  seamanBookExpiryDate?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  rank?: string;
  status?: string;
  vessel?: string;
  email?: string;
  phone?: string;
  landline?: string;
  address?: string;
  city?: string;
  province?: string;
  dateOfBirth?: string;
  age?: string;
  nationality?: string;
  joinDate?: string;
  contractEnd?: string;
  maritalStatus?: string;
  sex?: string;
  sssNumber?: string;
  philhealthNumber?: string;
  hdmfNumber?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  seamansBookNumber?: string;
  seamansBookIssueDate?: string;
  seamansBookExpiryDate?: string;
  selectedFile?: string;
  fileNumber?: string;
  registerDate?: string;
  verifyDate?: string;
  issuedDate?: string;
  expirationDate?: string;
  movements?: [];
  ProfileImage?: {
    FileContent: string;
    FileExtension: string;
    ContentType: string;
  }
  allottees?: Allottee[];
 crewPhoto?: File; 
}

export const mapMaritalStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    "1": "single",
    "2": "married",
    "3": "divorced",
    "4": "widowed",
  };
  return statusMap[status] || "";
};

export const mapGender = (status: string): string => {
  const genderMap: Record<string, string> = {
    "1": "male",
    "2": "female",
  };
  return genderMap[status] || "other";
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MM/dd/yyyy");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error formatting date:", error.message);
    } else {
      console.error("Unexpected error formatting date:", error);
    }
    return "";
  }
};

export const formatDayMonthYear = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MMMM d, yyyy");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error formatting date:", error.message);
    } else {
      console.error("Unexpected error formatting date:", error);
    }
    return "";
  }
};
export const calculateAge = (dateOfBirth: string | undefined) => {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} yrs old`;
};