"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  PhoneCall,
  Ship,
  User,
  X,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Icon } from "@iconify/react";
import { Check } from "lucide-react";
import { useToast } from "../ui/use-toast";
import Swal from "sweetalert2";

export default function AddCrew() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  // Add form state
  const [formData, setFormData] = useState({
    crewName: "",
    rank: "",
    status: "",
    crewCode: "",
    currentVessel: "",
    mobileNumber: "",
    landlineNumber: "",
    emailAddress: "",
    lastName: "",
    firstName: "",
    middleName: "",
    maritalStatus: "",
    sex: "",
    birthdate: "",
    city: "",
    province: "",
    // Add Government IDs fields
    sssNumber: "",
    taxIdNumber: "",
    philhealthNumber: "",
    hdmfNumber: "",
    // Add Travel Documents fields
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    seamansBook: "",
    seamansBookIssueDate: "",
    seamansBookExpiryDate: "",
  });

  // Add tab order array
  const tabOrder = ["details", "movement", "travel", "summary"];

  // Add navigation functions
  const handleNext = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      // Mark current tab as completed
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab]);
      }
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      // Remove completion status from current tab when going back
      setCompletedTabs(completedTabs.filter((tab) => tab !== activeTab));
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Calculate progress percentage
  const getProgress = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    return ((currentIndex + 1) / tabOrder.length) * 100;
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Prevent tab change when clicking on tabs
    return;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would typically make an API call to save the crew data
    // For now, we'll just show a success message and redirect
    toast({
      title: "Success!",
      description: "Crew member has been added successfully.",
    });

    // Redirect to crew list after a short delay
    setTimeout(() => {
      router.push("/home/crew");
    }, 1000);
  };

  const handleCancel = () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-primary hover:bg-primary text-white font-bold py-2 px-4 mx-2 rounded",
        cancelButton:
          "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Leave this page?",
        text: "You have unsaved changes. Are you sure you want to leave this page? Any unsaved details will be lost.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, leave anyway!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            router.push("/home/crew");
          }, 500);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
  };

  return (
    <>
      <div className="h-full w-full p-4 pt-3">
        <div className="flex flex-col space-y-6">
          {/* Header with back button and title */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Link href="/home/crew">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-semibold">Add Crew</h1>
            </div>
            <div className="flex gap-2">
              {/* Navigation Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={
                    activeTab === "details" ? handleCancel : handlePrevious
                  }
                  className="px-4"
                >
                  {activeTab === "details" ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 px-4"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
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

                  <div className="w-full space-y-3 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Enter CrewCode
                        </div>
                        <Input
                          value={formData.crewCode}
                          onChange={(e) =>
                            handleInputChange("crewCode", e.target.value)
                          }
                          className="h-8 mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">Rank</div>
                        <Input
                          value={formData.rank}
                          onChange={(e) =>
                            handleInputChange("rank", e.target.value)
                          }
                          className="h-8 mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Current Vessel
                        </div>
                        <Input
                          value={formData.currentVessel}
                          onChange={(e) =>
                            handleInputChange("currentVessel", e.target.value)
                          }
                          className="h-8 mt-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-4 pt-4 border-t min-w-0">
                    <h3 className="text-md font-semibold mb-3 text-left">
                      Contact Information
                    </h3>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500">
                            Mobile Number
                          </div>
                          <Input
                            value={formData.mobileNumber}
                            onChange={(e) =>
                              handleInputChange("mobileNumber", e.target.value)
                            }
                            className="h-8 mt-1 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500">
                            Landline Number
                          </div>
                          <Input
                            value={formData.landlineNumber}
                            onChange={(e) =>
                              handleInputChange(
                                "landlineNumber",
                                e.target.value
                              )
                            }
                            className="h-8 mt-1 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500">
                            Email Address
                          </div>
                          <Input
                            value={formData.emailAddress}
                            onChange={(e) =>
                              handleInputChange("emailAddress", e.target.value)
                            }
                            className="h-8 mt-1 text-sm"
                          />
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
                    <div className="px-4">
                      <TabsList className="bg-transparent p-0 h-11 w-full flex justify-between space-x-0">
                        <TabsTrigger
                          value="details"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none"
                        >
                          {completedTabs.includes("details") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Personal Information</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="movement"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none"
                        >
                          {completedTabs.includes("movement") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Government IDs</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="travel"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none"
                        >
                          {completedTabs.includes("travel") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Travel Documents</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="summary"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none"
                        >
                          {completedTabs.includes("summary") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Summary</span>
                        </TabsTrigger>
                      </TabsList>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-gray-200 mt-0">
                        <div
                          className="h-full bg-primary transition-all duration-700 ease-in-out rounded-full"
                          style={{ width: `${getProgress()}%` }}
                        />
                      </div>
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
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              First Name
                            </label>
                            <Input
                              placeholder="Enter first name"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Middle Name
                            </label>
                            <Input
                              placeholder="Enter middle name"
                              value={formData.middleName}
                              onChange={(e) =>
                                handleInputChange("middleName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Marital Status
                            </label>
                            <Select
                              value={formData.maritalStatus}
                              onValueChange={(value) =>
                                handleInputChange("maritalStatus", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">
                                  Divorced
                                </SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Sex
                            </label>
                            <Select
                              value={formData.sex}
                              onValueChange={(value) =>
                                handleInputChange("sex", value)
                              }
                            >
                              <SelectTrigger className="w-full">
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
                            <div className="relative">
                              <Input
                                type="date"
                                placeholder="Pick a date"
                                value={formData.birthdate}
                                onChange={(e) =>
                                  handleInputChange("birthdate", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              City
                            </label>
                            <Input
                              placeholder="Enter city"
                              value={formData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Province
                            </label>
                            <Input
                              placeholder="Enter province"
                              value={formData.province}
                              onChange={(e) =>
                                handleInputChange("province", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="movement"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                  >
                    <div className="space-y-8">
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
                              value={formData.sssNumber}
                              onChange={(e) =>
                                handleInputChange("sssNumber", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Tax ID Number
                            </label>
                            <Input
                              placeholder="Enter Tax ID number"
                              value={formData.taxIdNumber}
                              onChange={(e) =>
                                handleInputChange("taxIdNumber", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Philhealth Number
                            </label>
                            <Input
                              placeholder="Enter Philhealth number"
                              value={formData.philhealthNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "philhealthNumber",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              HDMF Number
                            </label>
                            <Input
                              placeholder="Enter HDMF number"
                              value={formData.hdmfNumber}
                              onChange={(e) =>
                                handleInputChange("hdmfNumber", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="travel"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                  >
                    <div className="space-y-8">
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
                              value={formData.passportNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "passportNumber",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Passport Issue Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                placeholder="Pick a date"
                                value={formData.passportIssueDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "passportIssueDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Passport Expiration Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                placeholder="Pick a date"
                                value={formData.passportExpiryDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "passportExpiryDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book
                            </label>
                            <Input
                              placeholder="Enter seamans book number"
                              value={formData.seamansBook}
                              onChange={(e) =>
                                handleInputChange("seamansBook", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book Issue Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                placeholder="Pick a date"
                                value={formData.seamansBookIssueDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "seamansBookIssueDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book Expiration Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                placeholder="Pick a date"
                                value={formData.seamansBookExpiryDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "seamansBookExpiryDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Add Summary Tab Content */}
                  <TabsContent
                    value="summary"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                  >
                    <div className="space-y-8">
                      {/* Personal Information Summary */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Personal Information Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Last Name
                            </label>
                            <Input
                              value={formData.lastName}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              First Name
                            </label>
                            <Input
                              value={formData.firstName}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Middle Name
                            </label>
                            <Input
                              value={formData.middleName}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Marital Status
                            </label>
                            <Select value={formData.maritalStatus} disabled>
                              <SelectTrigger className="w-full bg-gray-50">
                                <SelectValue placeholder="Not specified" />
                              </SelectTrigger>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Sex
                            </label>
                            <Select value={formData.sex} disabled>
                              <SelectTrigger className="w-full bg-gray-50">
                                <SelectValue placeholder="Not specified" />
                              </SelectTrigger>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Birthdate
                            </label>
                            <Input
                              type="date"
                              value={formData.birthdate}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              City
                            </label>
                            <Input
                              value={formData.city}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Province
                            </label>
                            <Input
                              value={formData.province}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Government IDs Summary */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Government IDs Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              SSS Number
                            </label>
                            <Input
                              value={formData.sssNumber}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Tax ID Number
                            </label>
                            <Input
                              value={formData.taxIdNumber}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Philhealth Number
                            </label>
                            <Input
                              value={formData.philhealthNumber}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              HDMF Number
                            </label>
                            <Input
                              value={formData.hdmfNumber}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Travel Documents Summary */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Travel Documents Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Passport Number
                            </label>
                            <Input
                              value={formData.passportNumber}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Passport Issue Date
                            </label>
                            <Input
                              type="date"
                              value={formData.passportIssueDate}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Passport Expiry Date
                            </label>
                            <Input
                              type="date"
                              value={formData.passportExpiryDate}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book Number
                            </label>
                            <Input
                              value={formData.seamansBook}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book Issue Date
                            </label>
                            <Input
                              type="date"
                              value={formData.seamansBookIssueDate}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Seamans Book Expiry Date
                            </label>
                            <Input
                              type="date"
                              value={formData.seamansBookExpiryDate}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          className="px-4"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          className="bg-primary hover:bg-primary/90 px-4"
                        >
                          Add Crew
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
