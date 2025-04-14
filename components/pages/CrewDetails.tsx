"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import {
  ChevronLeft,
  Pencil,
  User,
  Ship,
  Calendar,
  Phone,
  PhoneCall,
  Mail,
  Filter,
  Save,
  X,
  CircleMinus,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { RiShieldStarLine } from "react-icons/ri";
import { TbUserCheck } from "react-icons/tb";
import Swal from "sweetalert2";

// Add Zod schema after imports and before crewData
type Allottee = {
  name: string;
  relationship: string;
  contactNumber: string;
  address: string;
  city: string;
  active: boolean;
  priorityAmount: boolean;
  dollarAllotment: boolean;
};

const crewSchema = z.object({
  id: z.string().min(1, "Crew Code is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  middleName: z.string().optional(),
  rank: z.string().min(1, "Rank is required"),
  status: z.string(),
  vessel: z.string().min(1, "Current Vessel is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  phone: z.string().min(1, "Mobile Number is required"),
  landline: z.string().optional(),
  address: z.string(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  dateOfBirth: z.string().min(1, "Birthdate is required"),
  age: z.string(),
  nationality: z.string(),
  joinDate: z.string(),
  contractEnd: z.string(),
  maritalStatus: z.string().min(1, "Marital Status is required"),
  sex: z.string().min(1, "Sex is required"),
  // Government IDs
  sssNumber: z.string().min(1, "SSS Number is required"),
  taxIdNumber: z.string().min(1, "Tax ID Number is required"),
  philhealthNumber: z.string().min(1, "Philhealth Number is required"),
  hdmfNumber: z.string().min(1, "HDMF Number is required"),
  // Travel Documents
  passportNumber: z.string().min(1, "Passport Number is required"),
  passportIssueDate: z.string().min(1, "Passport Issue Date is required"),
  passportExpiryDate: z.string().min(1, "Passport Expiry Date is required"),
  seamansBookNumber: z.string().min(1, "Seamans Book Number is required"),
  seamansBookIssueDate: z
    .string()
    .min(1, "Seamans Book Issue Date is required"),
  seamansBookExpiryDate: z
    .string()
    .min(1, "Seamans Book Expiry Date is required"),
  movements: z
    .array(
      z.object({
        type: z.string(),
        date: z.string(),
        rank: z.string(),
        vessel: z.string(),
      })
    )
    .optional(),
});

type CrewSchema = z.infer<typeof crewSchema>;

// Import the sample crew data from CrewList
// In a real application, you would fetch this data from an API
const crewData = [
  {
    id: "CR001",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    middleName: "",
    rank: "Captain",
    status: "on board",
    vessel: "Atlas Island",
    email: "email@address",
    phone: "0919292929",
    landline: "2102-345-461",
    address: "123 Seafarer St., Manila, Philippines",
    city: "",
    province: "",
    dateOfBirth: "1992-06-15",
    age: "31 yrs old",
    nationality: "Filipino",
    joinDate: "2023-01-10",
    contractEnd: "2023-07-10",
    maritalStatus: "",
    sex: "",
    sssNumber: "",
    taxIdNumber: "",
    philhealthNumber: "",
    hdmfNumber: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    seamansBookNumber: "",
    seamansBookIssueDate: "",
    seamansBookExpiryDate: "",
    selectedFile: "Passport",
    fileNumber: "123456789",
    registerDate: "2023-01-10",
    verifyDate: "2023-01-10",
    issuedDate: "2023-01-10",
    expirationDate: "2023-01-10",
    allottees: [
      {
        name: "Maria Santos",
        relationship: "wife",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: true,
        dollarAllotment: true,
      },
      {
        name: "Juan Santos",
        relationship: "son",
        contactNumber: "09987654321",
        address: "212 Candelaria Quezon",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: false,
      },
      {
        name: "Ana Santos",
        relationship: "daughter",
        contactNumber: "09123456789",
        address: "123 Sampaguita Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: true,
      },
    ],
    movements: [
      {
        type: "Sign off",
        date: "10-23-23",
        rank: "Captain",
        vessel: "Atlas Island",
      },
      {
        type: "Sign in",
        date: "08-30-24",
        rank: "Captain",
        vessel: "Atlas Island",
      },
    ],
  },
  {
    id: "CR002",
    name: "Emily Chen",
    rank: "First Officer",
    status: "on board",
    vessel: "MV Pacific Voyager",
    email: "emily.chen@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Ocean Ave., Singapore",
    dateOfBirth: "1990-03-22",
    nationality: "Singaporean",
    joinDate: "2023-02-15",
    contractEnd: "2023-08-15",
    selectedFile: "Passport",
    fileNumber: "123456789",
    registerDate: "2023-01-10",
    verifyDate: "2023-01-10",
    issuedDate: "2023-01-10",
    expirationDate: "2023-01-10",
    movements: [
      {
        type: "Sign off",
        date: "10-23-23",
        rank: "First Officer",
        vessel: "Atlas Island",
      },
      {
        type: "Sign in",
        date: "09-30-24",
        rank: "First Officer",
        vessel: "Atlas Island",
      },
    ],
    allottees: [
      {
        name: "Maria Santos",
        relationship: "wife",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: true,
        dollarAllotment: true,
      },
      {
        name: "Juan Santos",
        relationship: "son",
        contactNumber: "09987654321",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: false,
      },
      {
        name: "Ana Santos",
        relationship: "daughter",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: true,
      },
    ],
  },
  {
    id: "CR003",
    name: "Michael Rodriguez",
    rank: "Chief Engineer",
    status: "off board",
    vessel: "",
    email: "michael.rodriguez@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Marine Dr., Manila, Philippines",
    dateOfBirth: "1982-11-05",
    nationality: "Filipino",
    joinDate: "2022-10-05",
    contractEnd: "2023-04-05",
    selectedFile: "Driver's License",
    fileNumber: "123456789",
    registerDate: "2023-01-10",
    verifyDate: "2023-01-10",
    issuedDate: "2023-01-10",
    expirationDate: "2023-01-10",
    allottees: [
      {
        name: "Maria Santos",
        relationship: "wife",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: true,
        dollarAllotment: true,
      },
      {
        name: "Juan Santos",
        relationship: "son",
        contactNumber: "09987654321",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: false,
      },
      {
        name: "Ana Santos",
        relationship: "daughter",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: true,
      },
    ],
  },
  {
    id: "CR004",
    name: "Sarah Johnson",
    rank: "Second Officer",
    status: "active",
    vessel: "MV Atlantic Explorer",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 234-5678",
    address: "321 Sailor's Way, London, UK",
    dateOfBirth: "1988-09-12",
    nationality: "British",
    joinDate: "2023-03-20",
    contractEnd: "2023-09-20",
    selectedFile: "Passport",
    fileNumber: "123456789",
    registerDate: "2023-01-10",
    verifyDate: "2023-01-10",
    issuedDate: "2023-01-10",
    expirationDate: "2023-01-10",
    allottees: [
      {
        name: "Maria Santos",
        relationship: "wife",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: true,
        dollarAllotment: true,
      },
      {
        name: "Juan Santos",
        relationship: "son",
        contactNumber: "09987654321",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: false,
      },
      {
        name: "Ana Santos",
        relationship: "daughter",
        contactNumber: "09123456789",
        address: "123 Barangay Mabuhay Street",
        city: "Manila",
        active: true,
        priorityAmount: false,
        dollarAllotment: true,
      },
    ],
  },
];

// Helper functions for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "on board":
      return "bg-green-500";
    case "off board":
      return "bg-yellow-500";
    case "active":
      return "bg-blue-500";
    case "inactive":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBgColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "on board":
      return "bg-green-100 text-green-800";
    case "off board":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Define the columns for the crew movement DataTable
type Movement = {
  type: string;
  date: string;
  rank: string;
  vessel: string;
};

const movementColumns: ColumnDef<Movement>[] = [
  {
    accessorKey: "type",
    header: "Movement Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="p-2 flex items-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${
              type === "Sign in"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="p-2">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => <div className="p-2">{row.getValue("rank")}</div>,
  },
];

export default function CrewDetails() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [crew, setCrew] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAllottee, setSelectedAllottee] = useState<string>("");
  const [selectedAllotmentType, setSelectedAllotmentType] =
    useState<string>("");
  const [filteredMovements, setFilteredMovements] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCrew, setEditedCrew] = useState<any>(null);
  const [allotteeActive, setAllotteeActive] = useState(true);
  const [priorityAmount, setPriorityAmount] = useState(false);
  const [dollarAllotment, setDollarAllotment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isEditingAllottee, setIsEditingAllottee] = useState(false);
  const [editedAllottee, setEditedAllottee] = useState<Allottee | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const openModal = (src: string): void => {
    setModalImage(src);
    setZoom(1); // Reset zoom
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3)); // max zoom level
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5)); // min zoom level
  };

  // Function that displays SweetAlert2 confirmation when deleting a crew member
  const handleDelete = (selectedAllottee: string) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-2 rounded",
        cancelButton:
          "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to delete this allottee? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Place your delete logic here, for example, API call or state update
          swalWithBootstrapButtons.fire({
            title: "Deleted!",
            text: "The allottee has been successfully deleted.",
            icon: "success",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your allottee is safe :)",
            icon: "error",
          });
        }
      });
  };

  useEffect(() => {
    // Find the crew member with the matching ID
    if (crewId) {
      const foundCrew = crewData.find((c) => c.id === crewId);
      if (foundCrew) {
        // Ensure all required fields are present
        const completeCrewData = {
          ...foundCrew,
          firstName:
            foundCrew.firstName ||
            (foundCrew.name ? foundCrew.name.split(" ")[0] : ""),
          lastName:
            foundCrew.lastName ||
            (foundCrew.name ? foundCrew.name.split(" ")[1] || "" : ""),
          middleName: foundCrew.middleName || "",
          city: foundCrew.city || "",
          province: foundCrew.province || "",
          age: foundCrew.age || "",
          landline: foundCrew.landline || "",
          maritalStatus: foundCrew.maritalStatus || "",
          sex: foundCrew.sex || "",
          sssNumber: foundCrew.sssNumber || "",
          taxIdNumber: foundCrew.taxIdNumber || "",
          philhealthNumber: foundCrew.philhealthNumber || "",
          hdmfNumber: foundCrew.hdmfNumber || "",
          passportNumber: foundCrew.passportNumber || "",
          passportIssueDate: foundCrew.passportIssueDate || "",
          passportExpiryDate: foundCrew.passportExpiryDate || "",
          seamansBookNumber: foundCrew.seamansBookNumber || "",
          seamansBookIssueDate: foundCrew.seamansBookIssueDate || "",
          seamansBookExpiryDate: foundCrew.seamansBookExpiryDate || "",
          movements: foundCrew.movements || [],
        };
        setCrew(completeCrewData);
        setEditedCrew(completeCrewData);
        setSelectedVessel(completeCrewData.vessel);
        setFilteredMovements(completeCrewData.movements || []);
      } else {
        setCrew(null);
        setEditedCrew(null);
      }
    }

    // Set active tab based on URL parameter
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // If switching to movement or allottee tab, exit edit mode
      if (tab === "movement" || tab === "allottee") {
        setIsEditing(false);
      }
    }
  }, [crewId, searchParams]);

  // Filter movements based on selected vessel
  const handleVesselChange = (value: string) => {
    setSelectedVessel(value);
    if (value && crew?.movements) {
      setFilteredMovements(
        crew.movements.filter((m: any) => m.vessel === value)
      );
    } else {
      setFilteredMovements(crew?.movements || []);
    }
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditedCrew(crew);
    }
    setIsEditing(!isEditing);
  };

  // Replace the validateFields function with Zod validation
  const validateFields = () => {
    const result = crewSchema.safeParse(editedCrew);

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Modify saveChanges function
  const saveChanges = () => {
    if (!validateFields()) {
      return; // Don't save if there are validation errors
    }

    // Update the name field based on first and last name
    const updatedCrew = {
      ...editedCrew,
      name: `${editedCrew.firstName} ${editedCrew.lastName}`,
    };

    // In a real app, you would send this data to an API
    setCrew(updatedCrew);
    setEditedCrew(updatedCrew);
    setIsEditing(false);
  };

  // Modify handleInputChange function
  const handleInputChange = (field: string, value: string) => {
    setEditedCrew({
      ...editedCrew,
      [field]: value,
    });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: "",
      });
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If switching to movement or allottee tab, exit edit mode
    if (value === "movement" || value === "allottee") {
      setIsEditing(false);
    }
  };

  // Update the Select components to show validation
  const renderSelect = (
    field: string,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <Select
        value={isEditing ? editedCrew[field] : crew[field]}
        onValueChange={(value) => isEditing && handleInputChange(field, value)}
        disabled={!isEditing}
      >
        <SelectTrigger
          className={`w-full ${
            validationErrors[field] ? "border-red-500" : ""
          }`}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isEditing && validationErrors[field] && (
        <p className="text-sm text-red-500 mt-1">{validationErrors[field]}</p>
      )}
    </div>
  );

  // Update the Input components to show validation
  const renderInput = (
    field: string,
    label: string,
    type: string = "text",
    placeholder: string = ""
  ) => (
    <div>
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={isEditing ? editedCrew[field] : crew[field]}
        onChange={(e) => isEditing && handleInputChange(field, e.target.value)}
        readOnly={!isEditing}
        className={validationErrors[field] ? "border-red-500" : ""}
      />
      {isEditing && validationErrors[field] && (
        <p className="text-sm text-red-500 mt-1">{validationErrors[field]}</p>
      )}
    </div>
  );

  const toggleAllotteeEdit = () => {
    setIsEditingAllottee(!isEditingAllottee);
  };

  const handleAllotteeChange = (value: string) => {
    setSelectedAllottee(value);
    const selectedAllotteeData = crew.allottees[parseInt(value)];
    setEditedAllottee(selectedAllotteeData);
  };

  if (!crew) {
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <p>Crew member not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 pt-3">
      <div className="flex flex-col space-y-6">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/home/crew">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold">Crew Details</h1>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleEditMode}
                className="border-gray-300 w-40"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 w-40"
                onClick={saveChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            activeTab === "details" && (
              <Button
                className="bg-primary hover:bg-primary/90 w-40"
                onClick={toggleEditMode}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Crew
              </Button>
            )
          )}
          {activeTab === "allottee" && (
            <div className="px-4 pt-0 flex justify-end gap-3">
              <Button
                onClick={() => handleDelete(selectedAllottee)}
                variant="destructive"
                className="px-6 bg-[#B63C3C] w-40"
              >
                <CircleMinus />
                Remove
              </Button>
              {isEditingAllottee ? (
                <>
                  <Button
                    variant="outline"
                    onClick={toggleAllotteeEdit}
                    className="border-gray-300 w-40"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 w-40"
                    onClick={toggleAllotteeEdit}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={toggleAllotteeEdit}
                    className="bg-[#2BA148] hover:bg-green-700 px-6 w-40"
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40">
                    <Plus />
                    Add Allottee
                  </Button>
                </>
              )}
            </div>
          )}
          {activeTab === "validation" && (
            <div className="px-4 pt-0 flex justify-end gap-3">
              <Button variant="destructive" className="px-6 bg-[#B63C3C] w-40">
                <CircleMinus className="h-4 w-4 mr-2" />
                Decline
              </Button>

              <Button className="bg-[#21299D] hover:bg-indigo-700 px-6 w-40">
                <TbUserCheck className="h-4 w-4 mr-2" />
                Verify Account
              </Button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with crew info */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
                <style jsx global>{`
                  /* Hide scrollbar for Chrome, Safari and Opera */
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }

                  /* Hide scrollbar for IE, Edge and Firefox */
                  .scrollbar-hide {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                  }
                `}</style>
                <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src="/image.png"
                    alt="Profile Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    className="mb-3 text-sm w-60 min-w-[160px] flex-shrink-0"
                  >
                    CHANGE PHOTO
                  </Button>
                )}
                <h2 className="text-lg font-bold mb-1 w-full">
                  {isEditing
                    ? `${editedCrew.firstName} ${editedCrew.lastName}`
                    : crew.name}
                </h2>
                <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
                  <div className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded-full border-green-300 flex items-center gap-1 flex-shrink-0">
                    {crew.status}
                  </div>
                </div>

                <div className="w-full space-y-3 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Crew Code</div>
                      {isEditing ? (
                        <>
                          <Input
                            value={editedCrew.id}
                            onChange={(e) =>
                              handleInputChange("id", e.target.value)
                            }
                            className={`h-8 mt-1 text-sm border-primary ${
                              validationErrors.id ? "border-red-500" : ""
                            }`}
                          />
                          {validationErrors.id && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.id}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm font-medium truncate">
                          {crew.id}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Rank</div>
                      {isEditing ? (
                        <>
                          <Input
                            value={editedCrew.rank}
                            onChange={(e) =>
                              handleInputChange("rank", e.target.value)
                            }
                            className={`h-8 mt-1 text-sm border-primary ${
                              validationErrors.rank ? "border-red-500" : ""
                            }`}
                          />
                          {validationErrors.rank && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.rank}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm font-medium truncate">
                          {crew.rank}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">
                        Current Vessel
                      </div>
                      {isEditing ? (
                        <>
                          <Input
                            value={editedCrew.vessel}
                            onChange={(e) =>
                              handleInputChange("vessel", e.target.value)
                            }
                            className={`h-8 mt-1 text-sm border-primary ${
                              validationErrors.vessel ? "border-red-500" : ""
                            }`}
                          />
                          {validationErrors.vessel && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.vessel}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-sm font-medium truncate">
                          {crew.vessel}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">Age</div>
                        <div className="text-sm font-medium truncate">
                          {calculateAge(crew.dateOfBirth)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full mt-4 pt-4 border-t min-w-0">
                  <h3 className="text-md font-semibold mb-3 text-left">
                    Contact Information
                  </h3>

                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Mobile Number
                        </div>
                        {isEditing ? (
                          <>
                            <Input
                              value={editedCrew.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              className={`h-8 mt-1 text-sm border-primary ${
                                validationErrors.phone ? "border-red-500" : ""
                              }`}
                            />
                            {validationErrors.phone && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-sm font-medium truncate">
                            {crew.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Landline Number
                        </div>
                        {isEditing ? (
                          <Input
                            value={editedCrew.landline}
                            onChange={(e) =>
                              handleInputChange("landline", e.target.value)
                            }
                            className="h-8 mt-1 text-sm"
                          />
                        ) : (
                          <div className="text-sm font-medium truncate">
                            {crew.landline}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Email Address
                        </div>
                        {isEditing ? (
                          <>
                            <Input
                              value={editedCrew.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className={`h-8 mt-1 text-sm border-primary ${
                                validationErrors.email ? "border-red-500" : ""
                              }`}
                            />
                            {validationErrors.email && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.email}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-sm font-medium truncate">
                            {crew.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right content area with tabs */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full flex flex-col h-full"
              >
                <div className="border-b">
                  <div className="px-4 pt-1">
                    <TabsList className="bg-transparent p-0 h-8 w-full flex justify-between space-x-0">
                      <TabsTrigger
                        value="details"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Crew Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="movement"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Crew Movement
                      </TabsTrigger>
                      <TabsTrigger
                        value="allottee"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        View Allottee
                      </TabsTrigger>
                      <TabsTrigger
                        value="validation"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Account Validation
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent
                  value="details"
                  className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            placeholder="Enter last name"
                            value={
                              isEditing ? editedCrew.lastName : crew.lastName
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("lastName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.lastName
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.lastName && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.lastName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={
                              isEditing ? editedCrew.firstName : crew.firstName
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("firstName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.firstName
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.firstName && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            placeholder="Enter middle name"
                            value={
                              isEditing
                                ? editedCrew.middleName
                                : crew.middleName
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("middleName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Marital Status
                          </label>
                          <Select
                            value={
                              isEditing
                                ? editedCrew.maritalStatus
                                : crew.maritalStatus
                            }
                            onValueChange={(value) =>
                              isEditing &&
                              handleInputChange("maritalStatus", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={`w-full ${
                                isEditing
                                  ? validationErrors.maritalStatus
                                    ? "border-red-500"
                                    : "border-primary"
                                  : ""
                              }`}
                            >
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                          {isEditing && validationErrors.maritalStatus && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.maritalStatus}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Sex
                          </label>
                          <Select
                            value={isEditing ? editedCrew.sex : crew.sex}
                            onValueChange={(value) =>
                              isEditing && handleInputChange("sex", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={`w-full ${
                                isEditing
                                  ? validationErrors.sex
                                    ? "border-red-500"
                                    : "border-primary"
                                  : ""
                              }`}
                            >
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {isEditing && validationErrors.sex && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.sex}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Birthdate
                          </label>
                          <div className="relative">
                            <Input
                              type="date"
                              placeholder="Pick a date"
                              value={
                                isEditing
                                  ? editedCrew.dateOfBirth
                                  : crew.dateOfBirth
                              }
                              onChange={(e) =>
                                isEditing &&
                                handleInputChange("dateOfBirth", e.target.value)
                              }
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? validationErrors.dateOfBirth
                                    ? "border-red-500"
                                    : "border-primary"
                                  : ""
                              }
                            />
                            {isEditing && validationErrors.dateOfBirth && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.dateOfBirth}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            placeholder="Enter city"
                            value={isEditing ? editedCrew.city : crew.city}
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("city", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.city
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.city && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.city}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            placeholder="Enter province"
                            value={
                              isEditing ? editedCrew.province : crew.province
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("province", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.province
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.province && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.province}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Government IDs Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">
                        Government IDs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            SSS Number
                          </label>
                          <Input
                            placeholder="Enter SSS number"
                            value={
                              isEditing ? editedCrew.sssNumber : crew.sssNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("sssNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.sssNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.sssNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.sssNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Tax ID Number
                          </label>
                          <Input
                            placeholder="Enter Tax ID number"
                            value={
                              isEditing
                                ? editedCrew.taxIdNumber
                                : crew.taxIdNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("taxIdNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.taxIdNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.taxIdNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.taxIdNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Philhealth Number
                          </label>
                          <Input
                            placeholder="Enter Philhealth number"
                            value={
                              isEditing
                                ? editedCrew.philhealthNumber
                                : crew.philhealthNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "philhealthNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.philhealthNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.philhealthNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.philhealthNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            HDMF Number
                          </label>
                          <Input
                            placeholder="Enter HDMF number"
                            value={
                              isEditing
                                ? editedCrew.hdmfNumber
                                : crew.hdmfNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("hdmfNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.hdmfNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.hdmfNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.hdmfNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Travel Documents Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">
                        Travel Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Passport Number
                          </label>
                          <Input
                            placeholder="Enter passport number"
                            value={
                              isEditing
                                ? editedCrew.passportNumber
                                : crew.passportNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.passportNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.passportNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.passportNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Passport Issue Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={
                              isEditing
                                ? editedCrew.passportIssueDate
                                : crew.passportIssueDate
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportIssueDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.passportIssueDate
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.passportIssueDate && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.passportIssueDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Passport Expiration Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={
                              isEditing
                                ? editedCrew.passportExpiryDate
                                : crew.passportExpiryDate
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportExpiryDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.passportExpiryDate
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.passportExpiryDate && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.passportExpiryDate}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book
                          </label>
                          <Input
                            placeholder="Enter seamans book number"
                            value={
                              isEditing
                                ? editedCrew.seamansBookNumber
                                : crew.seamansBookNumber
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.seamansBookNumber
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing && validationErrors.seamansBookNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.seamansBookNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book Issue Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={
                              isEditing
                                ? editedCrew.seamansBookIssueDate
                                : crew.seamansBookIssueDate
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookIssueDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.seamansBookIssueDate
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing &&
                            validationErrors.seamansBookIssueDate && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.seamansBookIssueDate}
                              </p>
                            )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book Expiration Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={
                              isEditing
                                ? editedCrew.seamansBookExpiryDate
                                : crew.seamansBookExpiryDate
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookExpiryDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? validationErrors.seamansBookExpiryDate
                                  ? "border-red-500"
                                  : "border-primary"
                                : ""
                            }
                          />
                          {isEditing &&
                            validationErrors.seamansBookExpiryDate && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.seamansBookExpiryDate}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="movement"
                  className="p-4 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <div className="space-y-6">
                    {/* Vessel selection and filter */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative rounded-lg border shadow-sm overflow-hidden">
                          <div className="flex h-11 w-full">
                            <div className="flex items-center px-4 bg-gray-50 border-r">
                              <span className="text-gray-700 font-medium whitespace-nowrap">
                                Select Vessel
                              </span>
                            </div>
                            <div className="flex-1 w-full flex items-center">
                              <Select
                                value={selectedVessel}
                                onValueChange={handleVesselChange}
                              >
                                <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                                  <SelectValue placeholder="Select vessel" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Atlas Island">
                                    Atlas Island
                                  </SelectItem>
                                  <SelectItem value="MV Pacific Voyager">
                                    MV Pacific Voyager
                                  </SelectItem>
                                  <SelectItem value="MV Atlantic Explorer">
                                    MV Atlantic Explorer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          className="h-11 px-5 border rounded-lg shadow-sm cursor-pointer"
                        >
                          <Filter className="h-5 w-5 text-primary mr-2" />
                          <span className="text-gray-700 font-medium">
                            Filter
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Movement history table */}
                    <div className="border rounded-md overflow-hidden pb-3">
                      {filteredMovements.length > 0 ? (
                        <DataTable
                          columns={movementColumns}
                          data={filteredMovements}
                          pagination={filteredMovements.length > 10}
                        />
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No movement records found for this vessel.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="allottee"
                  className="p-5 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  {crew.allottees && crew.allottees.length > 0 ? (
                    (() => {
                      // Determine the currently selected allottee (default to the first one)
                      const selectedIndex =
                        selectedAllottee !== ""
                          ? parseInt(selectedAllottee)
                          : 0;
                      const currentAllottee = crew.allottees[selectedIndex];

                      return (
                        <div className="space-y-5">
                          {/* Allottee selection and type */}
                          <div className="flex gap-4">
                            <div className="w-4/6">
                              <div className="relative rounded-lg border shadow-sm overflow-hidden">
                                <div className="flex h-11 w-full">
                                  <div className="flex items-center px-4 bg-gray-50 border-r">
                                    <span className="text-gray-700 font-medium whitespace-nowrap">
                                      Select Allottee
                                    </span>
                                  </div>
                                  <div className="flex-1 w-full flex items-center">
                                    <Select
                                      value={
                                        selectedAllottee !== ""
                                          ? selectedAllottee
                                          : "0"
                                      }
                                      onValueChange={handleAllotteeChange}
                                    >
                                      <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                                        <SelectValue placeholder="Select allottee" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {crew.allottees.map(
                                          (
                                            allottee: Allottee,
                                            index: number
                                          ) => (
                                            <SelectItem
                                              key={index}
                                              value={index.toString()}
                                            >
                                              {allottee.name}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-2/6">
                              <div className="relative rounded-lg border shadow-sm overflow-hidden">
                                <div className="flex h-11 w-full">
                                  <div className="flex items-center px-4 bg-gray-50 border-r">
                                    <span className="text-gray-700 font-medium whitespace-nowrap">
                                      Select
                                    </span>
                                  </div>
                                  <div className="flex-1 w-full flex items-center">
                                    <Select
                                      value={selectedAllotmentType}
                                      onValueChange={setSelectedAllotmentType}
                                    >
                                      <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                                        <SelectValue placeholder="Allotment Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="monthly">
                                          Monthly Allotment
                                        </SelectItem>
                                        <SelectItem value="one-time">
                                          One-time Payment
                                        </SelectItem>
                                        <SelectItem value="percentage">
                                          Percentage Based
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                          Fixed Amount
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Allottee Information Card */}
                          <div className="p-1 space-y-6">
                            {/* Allottee Personal Information */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-primary">
                                  Allottee Personal Information
                                </h3>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="active"
                                      checked={currentAllottee.active}
                                      onChange={(e) =>
                                        /* update allottee active state if needed */
                                        console.log("Active changed")
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                      htmlFor="active"
                                      className="text-sm font-medium text-gray-900"
                                    >
                                      Active
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="priority"
                                      checked={currentAllottee.priorityAmount}
                                      onChange={(e) =>
                                        console.log("Priority changed")
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                      htmlFor="priority"
                                      className="text-sm font-medium text-gray-900"
                                    >
                                      Priority for Amount Type
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="dollar"
                                      checked={currentAllottee.dollarAllotment}
                                      onChange={(e) =>
                                        console.log("Dollar changed")
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                      htmlFor="dollar"
                                      className="text-sm font-medium text-gray-900"
                                    >
                                      Dollar Allottment
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Name
                                  </label>
                                  <Input
                                    value={currentAllottee.name}
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Relationship
                                  </label>
                                  <Select
                                    value={currentAllottee.relationship}
                                    disabled={!isEditingAllottee}
                                  >
                                    <SelectTrigger
                                      className={`w-full h-10 ${
                                        !isEditingAllottee
                                          ? "bg-gray-50"
                                          : "border-primary"
                                      }`}
                                    >
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sister">
                                        Sister
                                      </SelectItem>
                                      <SelectItem value="brother">
                                        Brother
                                      </SelectItem>
                                      <SelectItem value="mother">
                                        Mother
                                      </SelectItem>
                                      <SelectItem value="father">
                                        Father
                                      </SelectItem>
                                      <SelectItem value="wife">Wife</SelectItem>
                                      <SelectItem value="son">Son</SelectItem>
                                      <SelectItem value="daughter">
                                        Daughter
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Contact Number
                                  </label>
                                  <Input
                                    value={currentAllottee.contactNumber}
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Address
                                  </label>
                                  <Input
                                    value={currentAllottee.address}
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    City
                                  </label>
                                  <Input
                                    value={currentAllottee.city}
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                                {/* If your allottee data has more fields (like province), add them here */}
                              </div>
                            </div>

                            {/* Bank Information (Optional) */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3 text-primary">
                                Bank Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Bank
                                  </label>
                                  <Select disabled={!isEditingAllottee}>
                                    <SelectTrigger
                                      className={`w-full h-10 ${
                                        !isEditingAllottee
                                          ? "bg-gray-50"
                                          : "border-primary"
                                      }`}
                                    >
                                      <SelectValue placeholder="BPI" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bpi">BPI</SelectItem>
                                      <SelectItem value="bdo">BDO</SelectItem>
                                      <SelectItem value="metrobank">
                                        Metrobank
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Branch
                                  </label>
                                  <Select disabled={!isEditingAllottee}>
                                    <SelectTrigger
                                      className={`w-full h-10 ${
                                        !isEditingAllottee
                                          ? "bg-gray-50"
                                          : "border-primary"
                                      }`}
                                    >
                                      <SelectValue placeholder="Ermita, Manila" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ermita">
                                        Ermita, Manila
                                      </SelectItem>
                                      <SelectItem value="makati">
                                        Makati
                                      </SelectItem>
                                      <SelectItem value="quezon">
                                        Quezon City
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Account Number
                                  </label>
                                  <Input
                                    value="3535436457568"
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="text-sm text-gray-500 mb-1 block">
                                    Allottment
                                  </label>
                                  <Input
                                    value="Dela Cruz"
                                    readOnly={!isEditingAllottee}
                                    className={`w-full h-10 ${
                                      !isEditingAllottee
                                        ? "bg-gray-50"
                                        : "border-primary"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p>No allottee data available.</p>
                  )}
                </TabsContent>

                <TabsContent
                  value="validation"
                  className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div>
                      <div className="flex items-center justify-start gap-x-5">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Crew Sign up Details
                        </h3>
                        <div className="text-sm px-5 mb-4 py-1 bg-gray-100 text-gray-800 rounded-full border border-gray-200 flex items-center gap-1 flex-shrink-0">
                          <p className="pt-0">pending</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Register Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={crew.registerDate}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Verified Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={crew.verifyDate}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            placeholder="Enter last name"
                            value={crew.lastName}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={crew.firstName}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            placeholder="Enter middle name"
                            value={crew.middleName}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Contact Number
                          </label>
                          <Input
                            placeholder="Enter a Number"
                            value={crew.phone}
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            placeholder="Enter city"
                            value={crew.city}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            placeholder="Enter province"
                            value={crew.province}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-start gap-x-5">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Valid Documents
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Selected File
                          </label>
                          <Input
                            placeholder="Select File"
                            value={crew.selectedFile}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Number
                          </label>
                          <Input
                            placeholder="Enter File Number"
                            value={crew.fileNumber}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Issued Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={crew.issuedDate}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Expiration Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Pick a date"
                            value={crew.expirationDate}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-start gap-x-5">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Valid Documents
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ID Attachment */}
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            ID Attachment
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">
                              sampleimagename.jpg
                            </h4>
                            <div
                              className="w-64 h-40 overflow-hidden rounded cursor-pointer mx-auto"
                              onClick={() => openModal("/placeholder.png")}
                            >
                              <img
                                src="/placeholder.png"
                                alt="ID Attachment"
                                className="object-cover w-full h-full transition-transform hover:scale-105"
                              />
                            </div>
                            <p className="flex justify-end text-xs text-gray-500 text-center mt-2">
                              Uploaded &middot; March 28, 2025
                            </p>
                          </div>
                        </div>

                        {/* Selfie with ID Attachment */}
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Selfie with ID Attachment
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">
                              placeholder..png
                            </h4>
                            <div
                              className="w-64 h-40 overflow-hidden rounded cursor-pointer mx-auto"
                              onClick={() => openModal("/placeholder.png")}
                            >
                              <img
                                src="/placeholder.png"
                                alt="Selfie with ID Attachment"
                                className="object-cover w-full h-full transition-transform hover:scale-105"
                              />
                            </div>
                            <p className="flex justify-end text-xs text-gray-500 text-center mt-2">
                              Uploaded &middot; March 28, 2025
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Modal */}
                      {modalImage && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                          {/* Close Button */}
                          <button
                            onClick={closeModal}
                            className="absolute top-5 left-5 text-white rounded-full w-10 h-10 flex items-center justify-center "
                          >
                            <X className="w-6 h-6" />
                          </button>

                          <div className="relative flex flex-col items-center">
                            <img
                              src={modalImage}
                              alt="Full View"
                              style={{ transform: `scale(${zoom})` }}
                              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg transition-transform"
                            />

                            {/* Zoom Controls Below the Image */}
                            <div className="mt-4 bg-neutral-800/90 text-white px-6 py-2 rounded-full flex items-center gap-6 z-50 shadow-lg">
                              <button onClick={zoomOut}>
                                <Minus className="w-6 h-6 hover:scale-110 transition-transform" />
                              </button>
                              <div className="flex items-center justify-center w-6 h-6">
                                <ZoomIn className="w-5 h-5 opacity-60" />
                              </div>
                              <button onClick={zoomIn}>
                                <Plus className="w-6 h-6 hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
