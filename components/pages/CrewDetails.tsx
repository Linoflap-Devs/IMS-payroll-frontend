"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  CircleMinus,
  Pencil,
  Save,
  User,
  Ship,
  Calendar,
  Phone,
  PhoneCall,
  Mail,
  X,
  Plus,
  ZoomIn,
  Minus,
} from "lucide-react";
import { RiShieldStarLine } from "react-icons/ri";
import { TbUserCheck } from "react-icons/tb";
import { type ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { useCrewStore } from "@/src/store/useCrewStore";
import { CrewMovement } from "./crew/CrewMovement";
import { CrewAllottee } from "./crew/CrewAllottee";

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

interface Crew {
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
  taxIdNumber?: string;
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
  movements?: any[];
  allottees?: Allottee[];
}

const mapMaritalStatus = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: "single",
    2: "married",
    3: "divorced",
    4: "widowed",
  };
  return statusMap[status] || "";
};

const mapGender = (status: number): string => {
  const genderMap: Record<number, string> = {
    1: "male",
    2: "female",
  };
  return genderMap[status] || "other";
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MM/dd/yyyy");
  } catch (e) {
    return "";
  }
};

export default function CrewDetails() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [crew, setCrew] = useState<Crew | null>(null);
  const [editedCrew, setEditedCrew] = useState<Crew | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAllottee, setSelectedAllottee] = useState<string>("");
  const [selectedAllotmentType, setSelectedAllotmentType] =
    useState<string>("");
  const [filteredMovements, setFilteredMovements] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [allotteeActive, setAllotteeActive] = useState(true);
  const [priorityAmount, setPriorityAmount] = useState(false);
  const [dollarAllotment, setDollarAllotment] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isEditingAllottee, setIsEditingAllottee] = useState(false);
  const [editedAllottee, setEditedAllottee] = useState<Allottee | null>(null);

  // Get crew details from store
  const {
    crewDetails,
    isLoadingDetails,
    detailsError,
    fetchCrewDetails,
    resetDetails,
  } = useCrewStore();

  useEffect(() => {
    if (crewId) {
      fetchCrewDetails(crewId);
    }
    return () => {
      resetDetails(); // Clean up on unmount
    };
  }, [crewId, fetchCrewDetails, resetDetails]);

  useEffect(() => {
    if (crewDetails) {
      const mappedCrew = {
        firstName: crewDetails.FirstName,
        lastName: crewDetails.LastName,
        middleName: crewDetails.MiddleName,
        name: `${crewDetails.FirstName} ${crewDetails.LastName}`,
        maritalStatus: mapMaritalStatus(crewDetails.MaritalStatus),
        sex: mapGender(crewDetails.Gender),
        dateOfBirth: crewDetails.Birthday,
        city: crewDetails.City,
        province: crewDetails.Province,
        sssNumber: crewDetails.SSSNumber,
        hdmfNumber: crewDetails.HDMFNumber,
        passportNumber: crewDetails.PassportNumber,
        passportIssueDate: crewDetails.PassPortIssueDate,
        passportExpiryDate: crewDetails.PassPortExpiredDate,
        seamansBookNumber: crewDetails.SRIBNumber,
        seamansBookIssueDate: crewDetails.SRIBIssueDate,
        seamansBookExpiryDate: crewDetails.SRIBExpiredDate,
      };

      setCrew(mappedCrew);
      setEditedCrew(mappedCrew);
    }
  }, [crewDetails]);

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

  const toggleEditMode = () => {
    if (isEditing) {
      setEditedCrew(crew);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    const updatedCrew = {
      ...editedCrew,
      name: `${editedCrew?.firstName} ${editedCrew?.lastName}`,
    };

    setCrew(updatedCrew);
    setEditedCrew(updatedCrew);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedCrew({
      ...editedCrew,
      [field]: value,
    });
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "movement" || value === "allottee") {
      setIsEditing(false);
    }
  };

  const toggleAllotteeEdit = () => {
    setIsEditingAllottee(!isEditingAllottee);
  };

  const handleAllotteeChange = (value: string) => {
    setSelectedAllottee(value);
    if (crew?.allottees) {
      const selectedAllotteeData = crew.allottees[parseInt(value)];
      setEditedAllottee(selectedAllotteeData);
    }
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
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>

                <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src="/image.png"
                    alt="Profile Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                <h2 className="text-lg font-bold mb-1 w-full">
                  {isEditing
                    ? `${editedCrew?.firstName} ${editedCrew?.lastName}`
                    : crew.name}
                </h2>

                <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
                  <div className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded-full border-green-300 flex items-center gap-1 flex-shrink-0">
                    {crew.status}
                  </div>
                </div>

                <div className="w-full space-y-3 text-left min-w-0">
                  {/* Crew information fields */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Crew Code</div>
                      <div className="text-sm font-medium truncate">
                        {crew.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Rank</div>
                      <div className="text-sm font-medium truncate">
                        {crew.rank}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">
                        Current Vessel
                      </div>
                      <div className="text-sm font-medium truncate">
                        {crew.vessel}
                      </div>
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
                        <div className="text-sm font-medium truncate">
                          {crew.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Landline Number
                        </div>
                        <div className="text-sm font-medium truncate">
                          {crew.landline}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Email Address
                        </div>
                        <div className="text-sm font-medium truncate">
                          {crew.email}
                        </div>
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
                              isEditing
                                ? editedCrew?.lastName
                                : crewDetails?.LastName || crew?.lastName || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("lastName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={
                              isEditing
                                ? editedCrew?.firstName
                                : crewDetails?.FirstName ||
                                  crew?.firstName ||
                                  ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("firstName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            placeholder="Enter middle name"
                            value={
                              isEditing
                                ? editedCrew?.middleName
                                : crewDetails?.MiddleName ||
                                  crew?.middleName ||
                                  ""
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
                                ? editedCrew?.maritalStatus
                                : crew?.maritalStatus || ""
                            }
                            onValueChange={(value) =>
                              isEditing &&
                              handleInputChange("maritalStatus", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={isEditing ? "border-primary" : ""}
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
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Sex
                          </label>
                          <Select
                            value={
                              isEditing ? editedCrew?.sex : crew?.sex || ""
                            }
                            onValueChange={(value) =>
                              isEditing && handleInputChange("sex", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={isEditing ? "border-primary" : ""}
                            >
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Birthdate
                          </label>
                          <Input
                            type="text"
                            placeholder="Date of Birth"
                            value={
                              isEditing
                                ? editedCrew?.dateOfBirth
                                : formatDate(crew?.dateOfBirth) || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            placeholder="Enter city"
                            value={
                              isEditing ? editedCrew?.city : crew?.city || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("city", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            placeholder="Enter province"
                            value={
                              isEditing
                                ? editedCrew?.province
                                : crew?.province || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("province", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
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
                              isEditing
                                ? editedCrew?.sssNumber
                                : crew?.sssNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("sssNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Tax ID Number
                          </label>
                          <Input
                            placeholder="Enter Tax ID number"
                            value={
                              isEditing
                                ? editedCrew?.taxIdNumber
                                : crew?.taxIdNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("taxIdNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Philhealth Number
                          </label>
                          <Input
                            placeholder="Enter Philhealth number"
                            value={
                              isEditing
                                ? editedCrew?.philhealthNumber
                                : crew?.philhealthNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "philhealthNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            HDMF Number
                          </label>
                          <Input
                            placeholder="Enter HDMF number"
                            value={
                              isEditing
                                ? editedCrew?.hdmfNumber
                                : crew?.hdmfNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange("hdmfNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
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
                                ? editedCrew?.passportNumber
                                : crew?.passportNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Passport Issue Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Passport Issue Date"
                            value={
                              isEditing
                                ? editedCrew?.passportIssueDate
                                : formatDate(crew?.passportIssueDate) || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportIssueDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Passport Expiration Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Passport Expiry Date"
                            value={
                              isEditing
                                ? editedCrew?.passportExpiryDate
                                : formatDate(crew?.passportExpiryDate) || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "passportExpiryDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book
                          </label>
                          <Input
                            placeholder="Enter seamans book number"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookNumber
                                : crew?.seamansBookNumber || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookNumber",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book Issue Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Seamans Book Issue Date"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookIssueDate
                                : formatDate(crew?.seamansBookIssueDate) || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookIssueDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Seamans Book Expiration Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Seamans Book Expiry Date"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookExpiryDate
                                : formatDate(crew?.seamansBookExpiryDate) || ""
                            }
                            onChange={(e) =>
                              isEditing &&
                              handleInputChange(
                                "seamansBookExpiryDate",
                                e.target.value
                              )
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="movement"
                  className="p-4 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <CrewMovement />
                </TabsContent>

                <TabsContent
                  value="allottee"
                  className="p-5 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <CrewAllottee />
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
                            type="text"
                            placeholder="Register Date"
                            value={formatDate(crew?.registerDate)}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Verified Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Verified Date"
                            value={formatDate(crew?.verifyDate)}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            placeholder="Enter last name"
                            value={crew?.lastName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={crew?.firstName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            placeholder="Enter middle name"
                            value={crew?.middleName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Contact Number
                          </label>
                          <Input
                            placeholder="Enter a Number"
                            value={crew?.phone || ""}
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            placeholder="Enter city"
                            value={crew?.city || ""}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            placeholder="Enter province"
                            value={crew?.province || ""}
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
                            value={crew?.selectedFile || ""}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Number
                          </label>
                          <Input
                            placeholder="Enter File Number"
                            value={crew?.fileNumber || ""}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Issued Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Issued Date"
                            value={formatDate(crew?.issuedDate)}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Expiration Date
                          </label>
                          <Input
                            type="text"
                            placeholder="Expiration Date"
                            value={formatDate(crew?.expirationDate)}
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
