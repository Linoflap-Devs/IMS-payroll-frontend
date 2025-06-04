"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
import { addCrew, AddCrewDataForm } from "@/src/services/crew/crew.api"; // Ensure this path is correct
import { useRef } from "react";
import Image from "next/image";
import { AxiosError } from "axios";

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
  const [crewPhotoFile, setCrewPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("/image.png"); // For image preview
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state during submission
  const fileInputRef = useRef<HTMLInputElement>(null); // For triggering file input
  const [duplicateError, setDuplicateError] = useState(false); // For duplicate crew code error

  const { fetchCrews: refreshCrewList } = useCrewStore.getState(); // To refresh list after adding

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrewPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCrewPhotoFile(null);
      setImagePreview("/image.png"); // Revert to default or placeholder
    }
  };

  const [submitted, setSubmitted] = useState<boolean>(false);

  // Add form state
  const [formData, setFormData] = useState({
    rank: "",
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

  const maritalStatuses = [
    { value: "1", label: "Single" },
    { value: "2", label: "Married" },
    { value: "4", label: "Separated" },
    { value: "3", label: "Widowed" },
  ];

  const sexOptions = [
    { value: "1", label: "Male" },
    { value: "2", label: "Female" },
  ];

  useEffect(() => {
    fetchCities();
    fetchProvinces();
    fetchCrewRanks();
  }, [fetchCities, fetchProvinces, fetchCrewRanks]);
  // Add tab order array
  const tabOrder = ["details", "movement", "travel", "summary"];

  // Add navigation functions
  const handleNext = async () => {
    // Make handleNext async if it calls handleSubmit
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      // Basic validation example for current tab before proceeding (optional but recommended)
      // if (!validateCurrentTab(activeTab)) { return; }

      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab]);
      }
      setActiveTab(tabOrder[currentIndex + 1]);
    } else if (activeTab === tabOrder[tabOrder.length - 1]) {
      // If on the last tab (Summary)
      await handleSubmit(); // Call the main submit function
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
  const handleTabChange = () => {
    // Prevent tab change when clicking on tabs
    return;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitted(true);

    // ** Client-side validation (Basic example - enhance as needed) **
    const requiredFields: (keyof typeof formData)[] = [
      "crewCode",
      "rank",
      "lastName",
      "firstName",
      "sex",
      "maritalStatus",
      "birthdate",
      "city",
      "province",
      "mobileNumber",
      "emailAddress",
      "sssNumber",
      "taxIdNumber",
      "philhealthNumber",
      "hdmfNumber",
      "passportNumber",
      "passportIssueDate",
      "passportExpiryDate",
      "seamansBook",
      "seamansBookIssueDate",
      "seamansBookExpiryDate",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        toast({
          title: "Missing Information",
          description: `Please fill in the '${field.replace(
            /([A-Z])/g,
            " $1"
          )}' field.`, // Add spaces for readability
          variant: "destructive",
        });
        setIsSubmitting(false);
        // Optionally, navigate to the tab where the missing field is
        return;
      }
    }
    // Email validation
    if (formData.emailAddress && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // ** Construct payload for the API **
    const payload: AddCrewDataForm = {
      crewCode: formData.crewCode,
      rank: formData.rank, // Assuming this is RankID as string
      vessel: formData.currentVessel || undefined, // Optional
      mobileNumber: formData.mobileNumber,
      landlineNumber: formData.landlineNumber || undefined, // Optional
      emailAddress: formData.emailAddress,
      lastName: formData.lastName,
      firstName: formData.firstName,
      middleName: formData.middleName || undefined, // Optional
      sex: formData.sex, // Assuming this is "1" for Male, "2" for Female, etc.
      maritalStatus: formData.maritalStatus, // Convert string to number
      dateOfBirth: formData.birthdate, // HTML date input provides YYYY-MM-DD
      city: formData.city, // Assuming this is CityID as string
      province: formData.province, // Assuming this is ProvinceID as string
      sssNumber: formData.sssNumber,
      tinNumber: formData.taxIdNumber, // Mapping from taxIdNumber
      philhealthNumber: formData.philhealthNumber,
      hdmfNumber: formData.hdmfNumber,
      passportNumber: formData.passportNumber,
      passportIssueDate: formData.passportIssueDate,
      passportExpiryDate: formData.passportExpiryDate,
      seamanBookNumber: formData.seamansBook, // Mapping from seamansBook
      seamanBookIssueDate: formData.seamansBookIssueDate,
      seamanBookExpiryDate: formData.seamansBookExpiryDate,
      crewPhoto: crewPhotoFile || undefined,
    };
    console.log(">>> Payload being sent to API:", payload);
    try {
      const response = await addCrew(payload);

      if (response.success) {
        Swal.fire({
          title: "Success!",
          text: response.message || "Crew member has been added successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6", // Or your primary color
        }).then(() => {
          refreshCrewList(); // Refresh the crew list in the store
          router.push("/home/crew");
        });
      } else {
        console.error("API Error:", response);
        Swal.fire({
          title: "Error!",
          text:
            response.message ||
            "Failed to add crew member. Please check the details and try again.",
          icon: "error",
        });
      }
    } catch (error: unknown) {
      console.log(error);

      // Define interface for the error response structure
      interface ApiErrorResponse {
        message: string | unknown[];
        // Add other properties if needed
      }

      // Check if error is an AxiosError
      if (
        error &&
        typeof error === "object" &&
        "isAxiosError" in error &&
        error.isAxiosError
      ) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const responseData = axiosError.response?.data;

        if (
          responseData?.message &&
          typeof responseData.message === "string" &&
          (responseData.message.includes("Unique constraint failed") ||
            responseData.message.includes("dbo.CrewData"))
        ) {
          // Display a user-friendly message specifically for duplicate crew code
          Swal.fire({
            title: "Duplicate Crew Code",
            text: "This Crew Code already exists in the system. Please use a different Crew Code.",
            icon: "warning",
          });
          setDuplicateError(true);
        } else {
          const errorMessage = axiosError.message;
          let errorDetails = "";

          if (axiosError.response?.data) {
            const responseData = axiosError.response.data;

            if (responseData.message && Array.isArray(responseData.message)) {
              errorDetails = responseData.message
                .map((msg: unknown) =>
                  typeof msg === "object"
                    ? JSON.stringify(msg, null, 2)
                    : String(msg)
                )
                .join("<br/>");
            } else if (responseData.message) {
              errorDetails = String(responseData.message);
            }
          }

          // Rest of your error handling...
          Swal.fire({
            title: errorMessage,
            html: errorDetails || axiosError.name,
            icon: "error",
            width: "auto",
            customClass: {
              htmlContainer: "swal2-html-container-custom",
            },
          });
        }
      } else {
        // This is a regular error
        const err = error as Error;
        Swal.fire({
          title: err.message,
          html: err.name,
          icon: "error",
          width: "auto",
          customClass: {
            htmlContainer: "swal2-html-container-custom",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCities = useMemo(() => {
    // If no province is selected, return empty array
    if (!formData.province) {
      return [];
    }

    const provinceId = parseInt(formData.province);
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceId
    );

    if (!citySearch.trim()) {
      return citiesInProvince.slice(0, 50); // Only show first 50 cities initially
    }

    return citiesInProvince
      .filter((city) =>
        city.CityName.toLowerCase().includes(citySearch.toLowerCase())
      )
      .slice(0, 100); // Limit to 100 results maximum for performance
  }, [cities, citySearch, formData.province]);

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

  console.log("Form Data:", formData);
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
                  disabled={isSubmitting} // Disable when submitting
                  className="px-4">
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
                  onClick={handleNext} // This now also calls handleSubmit on the last tab
                  className="bg-primary hover:bg-primary/90 px-4"
                  disabled={isSubmitting} // Disable when submitting
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        icon="line-md:loading-twotone-loop"
                        className="w-4 h-4 mr-2"
                      />
                      Submitting...
                    </>
                  ) : activeTab === tabOrder[tabOrder.length - 1] ? (
                    "Finish & Submit"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
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
                      <Image
                        src={imagePreview || "/image.png"} // Use the state for preview
                        alt="Crew Photo"
                        width={100}
                        height={100}
                        className="w-full h-full object-contain p-1" // Ensure image fits well
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-60"
                      onClick={() => fileInputRef.current?.click()} // Trigger file input
                    >
                      Add Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*,.jpeg,.jpg,.png" // Specify accepted image types
                      onChange={handleFileChange}
                    />
                    {/* <p className="text-red-400 text-sm">image is optional</p> */}
                  </div>

                  <div className="w-full space-y-2 text-left min-w-0">
                    <div className="flex flex-col items-start">
                      <label
                        htmlFor="crewCode"
                        className="text-sm text-gray-500">
                        Enter CrewCode
                      </label>
                      <Input
                        value={formData.crewCode}
                        onChange={(e) =>
                          handleInputChange("crewCode", e.target.value)
                        }
                        className={`h-8 mt-1 text-sm ${
                          (submitted && duplicateError) ||
                          formData.crewCode.length == 0
                            ? "border-red-500 focus:!ring-red-500/50"
                            : ""
                        }`}
                      />
                      {submitted && formData.crewCode.length == 0 && (
                        <p className="text-red-500 text-sm">
                          Please enter a valid crew code.
                        </p>
                      )}
                      {duplicateError && (
                        <p className="text-red-500 text-sm">
                          This Crew Code already exists.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <label className="text-sm text-gray-500">Rank</label>
                        <Select
                          value={formData.rank}
                          onValueChange={(value) =>
                            handleInputChange("rank", value)
                          }>
                          <SelectTrigger
                            className={`w-full ${
                              submitted && formData.rank.length == 0
                                ? "border-red-500 focus:!ring-red-500/60"
                                : ""
                            }`}>
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
                                  value={rank.RankID.toString()}>
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
                        {submitted && formData.rank.length == 0 && (
                          <p className="text-red-500 text-sm">
                            Please enter a rank.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <label className="text-sm text-gray-500">
                          Current Vessel
                        </label>
                        <Input
                          value={formData.currentVessel}
                          onChange={(e) =>
                            handleInputChange("currentVessel", e.target.value)
                          }
                          className="h-8 text-sm"
                          // className={`h-8 mt-1 text-sm ${
                          //   submitted && formData.currentVessel.length == 0
                          //     ? "border-red-500 focus:!ring-red-500/50"
                          //     : ""
                          // }`}
                        />
                        {/* {submitted && formData.currentVessel.length == 0 && (
                          <p className="text-red-500 text-sm">
                            Please enter a vessel.
                          </p>
                        )} */}
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-4 pt-4 border-t min-w-0">
                    <h3 className="text-md font-semibold mb-3 text-left">
                      Contact Information
                    </h3>

                    <div className="space-y-3 text-left">
                      <div className="flex flex-col items-start">
                        <div className="text-sm text-gray-500">
                          Mobile Number
                        </div>
                        <Input
                          value={formData.mobileNumber}
                          onChange={(e) =>
                            handleInputChange("mobileNumber", e.target.value)
                          }
                          className={`h-8 text-sm ${
                            submitted && formData.mobileNumber.length == 0
                              ? "border-red-500 focus:!ring-red-500/50"
                              : ""
                          }`}
                        />
                        {submitted && formData.mobileNumber.length == 0 && (
                          <p className="text-red-500 text-sm">
                            Please enter a valid mobile number.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-start">
                        <label className="text-sm text-gray-500">
                          Landline Number
                        </label>
                        <Input
                          value={formData.landlineNumber}
                          onChange={(e) =>
                            handleInputChange("landlineNumber", e.target.value)
                          }
                          // className={`h-8 text-sm ${
                          //   !fieldsError ? "border-red-500" : ""
                          // }`}
                          className={`h-8 text-sm`}
                        />
                        {/* {!fieldsError && (
                          <p className="text-red-500 text-sm">
                            Please enter a valid CrewCode.
                          </p>
                        )} */}
                      </div>

                      <div className="flex flex-col items-start">
                        <label className="text-sm text-gray-500">
                          Email Address
                        </label>
                        <Input
                          value={formData.emailAddress}
                          onChange={(e) =>
                            handleInputChange("emailAddress", e.target.value)
                          }
                          className={`h-8 text-sm ${
                            submitted && formData.emailAddress.length == 0
                              ? "border-red-500 focus:!ring-red-500/50"
                              : ""
                          }`}
                        />
                        {submitted && formData.emailAddress.length == 0 && (
                          <p className="text-red-500 text-sm">
                            Please enter a valid email address.
                          </p>
                        )}
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
                  className="w-full flex flex-col h-full">
                  <div className="border-b">
                    <div className="px-4">
                      <TabsList className="bg-transparent p-0 h-11 w-full flex justify-between space-x-0">
                        <TabsTrigger
                          value="details"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none">
                          {completedTabs.includes("details") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Personal Information</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="movement"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none">
                          {completedTabs.includes("movement") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Government IDs</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="travel"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none">
                          {completedTabs.includes("travel") && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/10 rounded-full p-0 w-6 h-6 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <span className="mt-5">Travel Documents</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="summary"
                          className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none relative pointer-events-none">
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
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1">
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
                              className={`${
                                submitted && formData.lastName.length == 0
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted && formData.lastName.length == 0 && (
                              <p className="text-red-500 text-sm">
                                Last name must be at least 2 characters.
                              </p>
                            )}
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
                              className={`${
                                submitted && formData.firstName.length == 0
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted && formData.firstName.length == 0 && (
                              <p className="text-red-500 text-sm">
                                First name must be at least 2 characters.
                              </p>
                            )}
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
                            {/* {!fieldsError && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid CrewCode.
                              </p>
                            )} */}
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Marital Status
                            </label>
                            <Select
                              value={formData.maritalStatus}
                              onValueChange={(value) =>
                                handleInputChange("maritalStatus", value)
                              }>
                              <SelectTrigger
                                className={`w-full ${
                                  submitted &&
                                  formData.maritalStatus.length == 0
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {maritalStatuses.map((status) => (
                                  <SelectItem
                                    key={status.value}
                                    value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {submitted &&
                              formData.maritalStatus.length == 0 && (
                                <p className="text-red-500 text-sm">
                                  Please enter a status.
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Sex
                            </label>
                            <Select
                              value={formData.sex}
                              onValueChange={(value) =>
                                handleInputChange("sex", value)
                              }>
                              <SelectTrigger
                                className={`w-full ${
                                  submitted && formData.sex.length == 0
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {sexOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {submitted && formData.sex.length == 0 && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid sex.
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
                                value={formData.birthdate}
                                onChange={(e) =>
                                  handleInputChange("birthdate", e.target.value)
                                }
                                className={`${
                                  submitted && formData.birthdate.length == 0
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                              />
                              {submitted && formData.birthdate.length == 0 && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid birthdate.
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Province
                            </label>
                            <Select
                              value={formData.province}
                              onValueChange={(value) =>
                                handleInputChange("province", value)
                              }>
                              <SelectTrigger
                                className={`w-full ${
                                  submitted && formData.province.length == 0
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}>
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
                                      value={province.ProvinceID.toString()}>
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
                            {submitted && formData.province.length == 0 && (
                              <p className="text-red-500 text-sm">
                                Please enter a province.
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              City
                            </label>
                            <Select
                              value={formData.city}
                              onValueChange={(value) =>
                                handleInputChange("city", value)
                              }>
                              <SelectTrigger
                                className={`w-full ${
                                  submitted && formData.city.length == 0
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                                disabled={!formData.province}>
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
                                      value={city.CityID.toString()}>
                                      {city.CityName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-sm text-gray-500">
                                    No cities found
                                  </div>
                                )}
                                {!citySearch && cities.length > 50 && (
                                  <div className="px-2 py-2 text-sm text-gray-500"></div>
                                )}
                              </SelectContent>
                            </Select>
                            {submitted && formData.city.length == 0 && (
                              <p className="text-red-500 text-sm">
                                Please enter a city.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="movement"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1">
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
                              className={`${
                                submitted && formData.sssNumber.length !== 10
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted && formData.sssNumber.length !== 10 && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid SSS number.
                              </p>
                            )}
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
                              className={`${
                                (submitted &&
                                  formData.taxIdNumber.length <= 8) ||
                                formData.taxIdNumber.length >= 13
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {((submitted && formData.taxIdNumber.length <= 8) ||
                              formData.taxIdNumber.length >= 13) && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid Tax ID number.
                              </p>
                            )}
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
                              className={`${
                                submitted &&
                                formData.philhealthNumber.length !== 12
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted &&
                              formData.philhealthNumber.length !== 12 && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Philhealth number.
                                </p>
                              )}
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
                              className={`${
                                submitted && formData.hdmfNumber.length !== 12
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted && formData.hdmfNumber.length !== 12 && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid CrewCode.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="travel"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1">
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
                              className={`${
                                (submitted &&
                                  formData.passportNumber.length <= 6) ||
                                formData.passportNumber.length >= 10
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {submitted &&
                              (formData.passportNumber.length <= 6 ||
                                formData.passportNumber.length >= 10) && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Passport number.
                                </p>
                              )}
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
                                className={`${
                                  submitted && !formData.passportIssueDate
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                              />
                              {submitted && !formData.passportIssueDate && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Passport Issue Date.
                                </p>
                              )}
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
                                className={`${
                                  submitted && !formData.passportExpiryDate
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                              />
                              {submitted && !formData.passportExpiryDate && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Passport Expiration Date.
                                </p>
                              )}
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
                              className={`${
                                (submitted &&
                                  formData.seamansBook.length <= 6) ||
                                formData.seamansBook.length >= 10
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : ""
                              }`}
                            />
                            {((submitted && formData.seamansBook.length <= 6) ||
                              formData.seamansBook.length >= 10) && (
                              <p className="text-red-500 text-sm">
                                Please enter a valid CrewCode.
                              </p>
                            )}
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
                                className={`${
                                  submitted && !formData.seamansBookIssueDate
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                              />
                              {submitted && !formData.seamansBookIssueDate && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Seamans Book Issue Date.
                                </p>
                              )}
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
                                className={`${
                                  submitted && !formData.seamansBookExpiryDate
                                    ? "border-red-500 focus:!ring-red-500/50"
                                    : ""
                                }`}
                              />
                              {submitted && !formData.seamansBookExpiryDate && (
                                <p className="text-red-500 text-sm">
                                  Please enter a valid Seamans Book Expiration
                                  Date.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Add Summary Tab Content */}
                  <TabsContent
                    value="summary"
                    className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1">
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
                            <Select
                              value={formData.maritalStatus || ""}
                              disabled>
                              <SelectTrigger className="w-full bg-gray-50">
                                <SelectValue placeholder="Not specified" />
                              </SelectTrigger>
                              <SelectContent>
                                {maritalStatuses.map((status) => (
                                  <SelectItem
                                    key={status.value}
                                    value={status.value.toString()}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">
                              Sex
                            </label>
                            <Select value={formData.sex || ""} disabled>
                              <SelectTrigger className="w-full bg-gray-50">
                                <SelectValue placeholder="Not specified" />
                              </SelectTrigger>
                              <SelectContent>
                                {sexOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
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
                              value={
                                filteredCities.find(
                                  (city) =>
                                    city.CityID.toString() === formData.city
                                )?.CityName
                              }
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-gray-500 mb-1 block">
                              Province
                            </label>
                            <Input
                              value={
                                filteredProvinces.find(
                                  (province) =>
                                    province.ProvinceID.toString() ===
                                    formData.province
                                )?.ProvinceName
                              }
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
