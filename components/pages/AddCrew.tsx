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
import { useEffect, useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Icon } from "@iconify/react";
import { Check } from "lucide-react";
import { useToast } from "../ui/use-toast";
import Swal from "sweetalert2";
import { useLocationStore } from "@/src/store/useLocationStore";
import { useCrewStore } from "@/src/store/useCrewStore";
import { addCrew } from "@/src/services/crew/crew.api";

export default function AddCrew() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { cities, provinces, fetchCities, fetchProvinces, loading } =
    useLocationStore();
  const { crewRanks, fetchCrewRanks } = useCrewStore();
  const [citySearch, setCitySearch] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [rankSearch, setRankSearch] = useState("");

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

  useEffect(() => {
    fetchCities();
    fetchProvinces();
    fetchCrewRanks();
  }, [fetchCities, fetchProvinces, fetchCrewRanks]);
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
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) {
      // Return a limited number of cities when no search is active
      return cities.slice(0, 50); // Only show first 50 cities initially
    }
    return cities
      .filter((city) =>
        city.CityName.toLowerCase().includes(citySearch.toLowerCase())
      )
      .slice(0, 100); // Limit to 100 results maximum for performance
  }, [cities, citySearch]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) {
      return provinces; // Usually provinces are fewer, so we can show all
    }
    return provinces.filter((province) =>
      province.ProvinceName.toLowerCase().includes(provinceSearch.toLowerCase())
    );
  }, [provinces, provinceSearch]);
  const filteredRanks = useMemo(() => {
    if (!rankSearch.trim()) {
      return crewRanks; // Usually ranks are fewer, so we can show all
    }
    return crewRanks.filter((rank) =>
      rank.RankName.toLowerCase().includes(rankSearch.toLowerCase())
    );
  }, [crewRanks, rankSearch]);

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
                  <div className="flex flex-col items-center mb-3">
                    <div className="w-60 h-60 min-w-[160px] bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 relative">
                      <img
                        src="/image.png"
                        alt="Profile Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-60"
                      onClick={() => {
                        // This would normally trigger a file input
                        console.log("Add image clicked");
                        // You could add actual file upload functionality here
                      }}
                    >
                      Add Image
                    </Button>
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
                        <Select
                          value={formData.rank}
                          onValueChange={(value) =>
                            handleInputChange("rank", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a rank" />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            <div className="px-2 py-2 sticky top-0 bg-white z-10">
                              <Input
                                placeholder="Search ranks..."
                                value={rankSearch}
                                onChange={(e) => setRankSearch(e.target.value)}
                                className="h-8"
                              />
                            </div>
                            {filteredRanks.length > 0 ? (
                              filteredRanks.map((rank) => (
                                <SelectItem
                                  key={rank.RankID}
                                  value={rank.RankID.toString()}
                                >
                                  {rank.RankName}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-2 text-sm text-gray-500">
                                No ranks found
                              </div>
                            )}
                          </SelectContent>
                        </Select>
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
                                <SelectItem value="1">Single</SelectItem>
                                <SelectItem value="2">Married</SelectItem>
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
                                <SelectItem value="1">Male</SelectItem>
                                <SelectItem value="2">Female</SelectItem>
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
                            <Select
                              value={formData.city}
                              onValueChange={(value) =>
                                handleInputChange("city", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <div className="px-2 py-2 sticky top-0 bg-white z-10">
                                  <Input
                                    placeholder="Search cities..."
                                    value={citySearch}
                                    onChange={(e) =>
                                      setCitySearch(e.target.value)
                                    }
                                    className="h-8"
                                  />
                                </div>
                                {loading ? (
                                  <SelectItem value="loading">
                                    Loading...
                                  </SelectItem>
                                ) : filteredCities.length > 0 ? (
                                  filteredCities.map((city) => (
                                    <SelectItem
                                      key={city.CityID}
                                      value={city.CityID.toString()}
                                    >
                                      {city.CityName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-sm text-gray-500">
                                    No cities found
                                  </div>
                                )}
                                {!citySearch && cities.length > 50 && (
                                  <div className="px-2 py-2 text-xs text-gray-500">
                                    Showing first 50 cities. Use search to find
                                    more.
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Province
                            </label>
                            <Select
                              value={formData.province}
                              onValueChange={(value) =>
                                handleInputChange("province", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a province" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <div className="px-2 py-2 sticky top-0 bg-white z-10">
                                  <Input
                                    placeholder="Search provinces..."
                                    value={provinceSearch}
                                    onChange={(e) =>
                                      setProvinceSearch(e.target.value)
                                    }
                                    className="h-8"
                                  />
                                </div>
                                {loading ? (
                                  <SelectItem value="loading">
                                    Loading...
                                  </SelectItem>
                                ) : filteredProvinces.length > 0 ? (
                                  filteredProvinces.map((province) => (
                                    <SelectItem
                                      key={province.ProvinceID}
                                      value={province.ProvinceID.toString()}
                                    >
                                      {province.ProvinceName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-sm text-gray-500">
                                    No provinces found
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
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
