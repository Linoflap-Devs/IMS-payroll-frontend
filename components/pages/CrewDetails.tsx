"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import { CrewMovement } from "./crew/CrewMovement";
import { CrewAllottee } from "./crew/CrewAllottee";
import { useCrewDetails } from "@/src/hooks/useCrewDetails";
import { CrewSidebar } from "@/components/CrewSidebar";
import { CrewHeader } from "@/components/CrewHeader";
import { ImageModal } from "@/components/ImageModal";
import { formatDate, formatDayMonthYear } from "@/types/crew";
import { useLocationStore } from "@/src/store/useLocationStore";
import Base64Image from "../Base64Image";
import Image from "next/image";
import {
  declineCrew,
  verifyCrew,
} from "@/src/services/crew/crewValidation.api";
import { toast } from "../ui/use-toast";
import { useCrewStore } from "@/src/store/useCrewStore";
import { useEditAllotteeStore } from "@/src/store/useEditAllotteeStore";

export default function CrewDetails() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("details");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isEditingAllottee, setIsEditingAllottee] = useState(false);
  const [isAddingAllottee, setIsAddingAllottee] = useState(false);
  const [triggerSave, setTriggerSave] = useState(false);
  const [allotteeLoading, setAllotteeLoading] = useState(false);
  const [triggerDelete, setTriggerDelete] = useState(false);
  const [isDeletingAllottee, setIsDeletingAllottee] = useState(false);
  const [triggerAdd, setTriggerAdd] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [currentSelfieIndex, setCurrentSelfieIndex] = useState(0);

  const [displayProvinceCity, setDisplayProvinceCity] = useState({
    provinceName: "",
    cityName: "",
    provinceId: "",
    cityId: "",
  });

  const [handleVerify, setHandleVerify] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [handleDecline, setHandleDecline] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleTriggerVerify = () => {
    setHandleVerify((prev) => !prev);
  };

  const handleTriggerDecline = () => {
    setHandleDecline((prev) => !prev);
  };

  // const handleTriggerAdd = () => {
  //   setTriggerAdd((prev) => !prev);
  // };

  const {
    crew,
    editedCrew,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    handleInputChange,
    saveChanges,
    toggleEditMode,
    setEditedCrew,
    isEditLoading,
    crewValidationDetails,
    isCrewVerified,
  } = useCrewDetails(crewId);

  const { fetchCrewValidationDetails } = useCrewStore();
  const clearDraft = useEditAllotteeStore((state) => state.clearDraft);
  const drafts = useEditAllotteeStore((state) => state.drafts);

  useEffect(() => {
    if (handleVerify) {
      setIsVerifying(true);

      if (!crewId) return;

      verifyCrew(crewId)
        .then(() => {
          toast({
            title: "Success",
            description: "Crew member verified successfully.",
            variant: "success",
          });
        })
        .catch((error) => {
          const err = error as Error;
          console.error("Error verifying crew member:", err);
          toast({
            title: "Error",
            description: "Crew did not register.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsVerifying(false);
          setHandleVerify(false);
        });
    }
  }, [handleVerify, crewId]);

  useEffect(() => {
    if (handleDecline) {
      setIsDeclining(true);

      if (!crewId) return;

      declineCrew(crewId)
        .then(() => {
          toast({
            title: "Success",
            description: "Crew member declined successfully.",
            variant: "success",
          });
        })
        .catch((error) => {
          const err = error as Error;
          console.error("Error declining crew member:", err);
          toast({
            title: "Error",
            description: "Crew did not register.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsDeclining(false);
          setHandleDecline(false);
        });
    }
  }, [handleDecline, crewId]);

  useEffect(() => {
    if (!crewId) return;

    if (handleDecline || handleVerify) {
      fetchCrewValidationDetails(crewId);
    }
  }, [crewId, fetchCrewValidationDetails, handleDecline, handleVerify]);

  const { cities, provinces, fetchCities, fetchProvinces } = useLocationStore();

  useEffect(() => {
    fetchCities();
    fetchProvinces();
  }, [fetchCities, fetchProvinces]);

  // Store province and city names along with IDs when data is loaded
  useEffect(() => {
    if (crew && provinces.length > 0 && cities.length > 0) {
      let provinceId = "";
      let cityId = "";
      let provinceName = crew.province || "";
      let cityName = crew.city || "";

      // Check if province is already an ID
      const isProvinceId = !isNaN(Number(crew.province));
      if (isProvinceId) {
        // If it's an ID, find the name
        const foundProvince = provinces.find(
          (p) => p.ProvinceID.toString() === crew.province
        );
        if (foundProvince) {
          provinceName = foundProvince.ProvinceName;
          provinceId = crew.province || "";
        }
      } else {
        // If it's a name, find the ID
        const foundProvince = provinces.find(
          (p) => p.ProvinceName === crew.province
        );
        if (foundProvince) {
          provinceId = foundProvince.ProvinceID.toString();
        }
      }

      // Check if city is already an ID
      const isCityId = !isNaN(Number(crew.city));
      if (isCityId) {
        // If it's an ID, find the name
        const foundCity = cities.find((c) => c.CityID.toString() === crew.city);
        if (foundCity) {
          cityName = foundCity.CityName;
          cityId = crew.city || "";
        }
      } else {
        // If it's a name, find the ID
        const foundCity = cities.find((c) => c.CityName === crew.city);
        if (foundCity) {
          cityId = foundCity.CityID.toString();
        }
      }

      // Update the display state with both names and IDs
      setDisplayProvinceCity({
        provinceName,
        cityName,
        provinceId,
        cityId,
      });
    }
  }, [crew, provinces, cities]);

  // Update editedCrew with province and city IDs when editing starts
  useEffect(() => {
    if (
      isEditing &&
      displayProvinceCity.provinceId &&
      displayProvinceCity.cityId
    ) {
      setEditedCrew((prev) => ({
        ...prev,
        province: displayProvinceCity.provinceId,
        city: displayProvinceCity.cityId,
      }));
    }
  }, [isEditing, displayProvinceCity, setEditedCrew]);

  // Update province and city info when saving changes
  const handleSave = () => {
    setSubmitted(true);
    if (isEditing && !validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please check the form for errors and try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Update display names for province and city before saving
    if (editedCrew?.province) {
      const foundProvince = provinces.find(
        (p) => p.ProvinceID.toString() === editedCrew.province
      );
      if (foundProvince) {
        setDisplayProvinceCity((prev) => ({
          ...prev,
          provinceName: foundProvince.ProvinceName,
          provinceId: editedCrew.province || "",
        }));
      }
    }

    if (editedCrew?.city) {
      const foundCity = cities.find(
        (c) => c.CityID.toString() === editedCrew.city
      );
      if (foundCity) {
        setDisplayProvinceCity((prev) => ({
          ...prev,
          cityName: foundCity.CityName,
          cityId: editedCrew.city || "",
        }));
      }
    }

    setTriggerSave((prev) => !prev);
    saveChanges();
  };

  const handleSaveAllottee = () => {
    setTriggerSave(true);
  };

  // Filter cities based on selected province
  const filteredCities = useMemo(() => {
    if (!editedCrew?.province) return [];

    const provinceIdNum = parseInt(editedCrew.province);
    return cities.filter((city) => city.ProvinceID === provinceIdNum);
  }, [cities, editedCrew?.province]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch) return provinces;
    return provinces.filter((province) =>
      province.ProvinceName.toLowerCase().includes(provinceSearch.toLowerCase())
    );
  }, [provinces, provinceSearch]);

  // Filter cities for search
  const filteredSearchCities = useMemo(() => {
    if (!filteredCities.length) return [];
    if (!citySearch) return filteredCities;

    return filteredCities.filter((city) =>
      city.CityName.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [filteredCities, citySearch]);

  // Sanitize a string by removing spaces, dashes, and non-alphanumeric characters
  const sanitizeAlphanumeric = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9]/g, "").trim();
  };

  const sanitizeDigits = (value: string) => value.replace(/[-\s]/g, "");

  const validateForm = () => {
    setSubmitted(true);

    if (!editedCrew) return false;

    // First Name, Last Name and address (required, must be >= 1 || 2)
    if (!editedCrew.firstName || editedCrew.firstName.length < 2) return false;
    if (!editedCrew.lastName || editedCrew.lastName.length < 2) return false;
    if (!editedCrew.address || editedCrew.address.length < 2) return false;

    // Sex (optional - no validation if not filled)
    // Marital Status (optional - no validation if not filled)
    // Date of Birth (optional - no validation if not filled)
    // Province & City (optional - no validation if not filled)

    // Government IDs (optional but must validate if provided)
    // Validation for SSS Number (accepts with dashes/spaces, but checks 10 digits)
    if (
      editedCrew.sssNumber &&
      sanitizeDigits(editedCrew.sssNumber).length !== 10
    ) {
      return false;
    }

    if (
      editedCrew.tinNumber &&
      (sanitizeDigits(editedCrew.tinNumber).length < 9 ||
        sanitizeDigits(editedCrew.tinNumber).length > 12)
    ) {
      return false;
    }

    if (
      editedCrew.philhealthNumber &&
      sanitizeDigits(editedCrew.philhealthNumber).length !== 12
    ) {
      return false;
    }

    if (
      editedCrew.hdmfNumber &&
      sanitizeDigits(editedCrew.hdmfNumber).length !== 12
    ) {
      return false;
    }

    // Passport (optional, validate if filled)
    if (editedCrew.passportNumber) {
      const sanitizedPassport = editedCrew.passportNumber.replace(/[^a-zA-Z0-9]/g, "").trim();

      // Require at least 7 and at most 9 characters
      if (sanitizedPassport.length < 7 || sanitizedPassport.length > 9) {
        return false;
      }
    }

    // Validate passport dates
    if (editedCrew.passportIssueDate || editedCrew.passportExpiryDate) {
      if (!editedCrew.passportIssueDate || !editedCrew.passportExpiryDate) {
        // One is missing
        return false;
      }

      const issueDate = new Date(editedCrew.passportIssueDate);
      const expiryDate = new Date(editedCrew.passportExpiryDate);

      if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
        // Invalid date format
        return false;
      }

      if (expiryDate <= issueDate) {
        // Expiry must be strictly after issue date
        return false;
      }
    }

    // Seaman’s Book (optional, validate if filled)
    if (editedCrew.seamansBookNumber && editedCrew.seamansBookNumber.length < 6) {
      return false;
    }

    // Validate dates if either is filled
    if (
      (editedCrew.seamansBookIssueDate && !editedCrew.seamansBookExpiryDate) ||
      (!editedCrew.seamansBookIssueDate && editedCrew.seamansBookExpiryDate)
    ) {
      return false;
    }

    // Ensure expiry is after issue
    if (
      editedCrew.seamansBookIssueDate &&
      editedCrew.seamansBookExpiryDate &&
      new Date(editedCrew.seamansBookExpiryDate) <= new Date(editedCrew.seamansBookIssueDate)
    ) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (isEditing) {
      setEditedCrew(prev => ({
        ...prev!,
        tinNumber: prev?.tinNumber ?? crew?.TaxIDNumber ?? "",
      }));
    }
  }, [isEditing, crew]); // removed editedCrew

  const openModal = (src: string): void => {
    setModalImage(src);
    setZoom(1);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["details", "movement", "allottee", "validation"].includes(tab.toString())
    ) {
      setActiveTab(tab.toString());
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "movement" || value === "allottee") {
      setIsEditing(false);
    }

    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);

    window.history.pushState({}, "", url.toString());
    setIsEditingAllottee(false);
  };

  const toggleAllotteeEdit = () => {
    setIsEditingAllottee(!isEditingAllottee);

    const firstDraftId = Number(Object.keys(drafts)[0]);
  
    if (firstDraftId) {
      clearDraft(firstDraftId);
    };
  };

  // working to -> true
  const toggleAllotteeAdd = () => {
    setIsAddingAllottee(!isAddingAllottee);
    setTriggerSave(false);
  };

  const handleDeleteAllottee = () => {
    setIsDeletingAllottee(!isDeletingAllottee);
    setTriggerDelete(true);
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
          Swal.fire({
            title: "Cancelled",
            text: "Process cancelled.",
            icon: "error",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your allottee is safe.",
            icon: "error",
          });
        }
      });
  };

  if (isLoading)
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <p>Loading crew details...</p>
      </div>
    );

  if (error)
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <p>Error loading crew: {error}</p>
      </div>
    );

  if (!crew)
    return (
      <div className="h-full w-full p-4 flex items-center justify-center">
        <p>Crew member not found.</p>
      </div>
    );

  return (
    <div className="h-full w-full p-4 pt-3">
      <div className="flex flex-col space-y-6">
        <CrewHeader
          isEditLoading={isEditLoading}
          isEditing={isEditing}
          activeTab={activeTab}
          toggleEditMode={toggleEditMode}
          saveChanges={handleSave}
          isEditingAllottee={isEditingAllottee}
          toggleAllotteeEdit={toggleAllotteeEdit}
          handleDelete={handleDelete}
          toggleAllotteeAdd={toggleAllotteeAdd}
          isAddingAllottee={isAddingAllottee}
          handleSave={handleSave}
          allotteeLoading={allotteeLoading}
          handleDeleteAllottee={handleDeleteAllottee}
          isAddLoading={isAddLoading}
          isDeletingAllottee={isDeletingAllottee}
          handleTriggerVerify={handleTriggerVerify}
          isVerifying={isVerifying}
          isCrewVerified={isCrewVerified}
          handleTriggerDecline={handleTriggerDecline}
          isDeclining={isDeclining}
          isRegistered={crewValidationDetails?.RegisterDate || null}
          handleSaveAllottee={handleSaveAllottee}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CrewSidebar
            crew={crew}
            isEditing={isEditing}
            editedCrew={editedCrew}
            handleInputChange={handleInputChange}
            submitted={submitted}
          />
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
                        disabled={isEditingAllottee}
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Crew Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="movement"
                        disabled={isEditing || isEditingAllottee}
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Crew Movement
                      </TabsTrigger>
                      <TabsTrigger
                        value="allottee"
                        disabled={isEditing}
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Allottee Profile
                      </TabsTrigger>
                      <TabsTrigger
                        value="validation"
                        disabled={isEditing || isEditingAllottee}
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                      <h3 className="text-lg font-bold mb-4 text-primary">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            placeholder="Enter last name"
                            value={
                              isEditing ? editedCrew?.lastName || "" : crew.lastName || ""
                            }
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.lastName || editedCrew.lastName.length < 2)
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.lastName || editedCrew.lastName.length < 2) && (
                              <p className="text-red-500 text-sm mt-1">
                                Last name is required and must be at least 2 characters.
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={
                              isEditing ? editedCrew?.firstName || "" : crew.firstName || ""
                            }
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.firstName || editedCrew.firstName.length < 2)
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.firstName || editedCrew.firstName.length < 2) && (
                              <p className="text-red-500 text-sm mt-1">
                                First name is required and must be at least 2 characters.
                              </p>
                            )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            value={
                              isEditing
                                ? editedCrew?.middleName || ""
                                : crew.middleName || ""
                            }
                            onChange={(e) =>
                              handleInputChange("middleName", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Marital Status
                          </label>
                          <Select
                            value={
                              isEditing
                                ? editedCrew?.maritalStatus || ""
                                : crew.maritalStatus || ""
                            }
                            onValueChange={(value) =>
                              handleInputChange("maritalStatus", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={isEditing ? "w-full border-primary" : "w-full"}
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
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Sex
                          </label>
                          <Select
                            value={isEditing ? editedCrew?.sex || "" : crew.sex || ""}
                            onValueChange={(value) => handleInputChange("sex", value)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger
                              className={isEditing ? "w-full border-primary" : "w-full"}
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
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Birthdate
                          </label>
                          <Input
                            type="date"
                            placeholder="Date of Birth"
                            value={
                              isEditing
                                ? editedCrew?.dateOfBirth
                                  ? new Date(editedCrew.dateOfBirth).toISOString().split("T")[0]
                                  : ""
                                : crew.dateOfBirth
                                  ? new Date(crew.dateOfBirth).toISOString().split("T")[0]
                                  : ""
                            }
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div>

                        {/* Province Select Component */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Province
                          </label>
                          {isEditing ? (
                            <Select
                              value={editedCrew?.province || ""}
                              onValueChange={(value) => handleInputChange("province", value)}
                              disabled={!isEditing}
                            >
                              <SelectTrigger className="border-primary w-full">
                                <SelectValue placeholder="Select a province" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <div className="px-2 py-2 sticky top-0 bg-white z-10">
                                  <Input
                                    placeholder="Search provinces..."
                                    value={provinceSearch}
                                    onChange={(e) => setProvinceSearch(e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                {filteredProvinces.length > 0 ? (
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
                          ) : (
                            <Input value={displayProvinceCity.provinceName || ""} readOnly />
                          )}
                        </div>

                        {/* City Select Component */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            City
                          </label>
                          {isEditing ? (
                            <Select
                              value={editedCrew?.city || ""}
                              onValueChange={(value) => handleInputChange("city", value)}
                              disabled={!isEditing || !editedCrew?.province}
                            >
                              <SelectTrigger className="border-primary w-full">
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <div className="px-2 py-2 sticky top-0 bg-white z-10">
                                  <Input
                                    placeholder="Search cities..."
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                                {filteredSearchCities.length > 0 ? (
                                  filteredSearchCities.map((city) => (
                                    <SelectItem key={city.CityID} value={city.CityID.toString()}>
                                      {city.CityName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-sm text-gray-500">
                                    {!editedCrew?.province
                                      ? "Please select a province first"
                                      : "No cities found"}
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input value={displayProvinceCity.cityName || ""} readOnly />
                          )}
                        </div>

                        {/* Home address */}
                        {/* <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Address (House/Unit No., Lot/Block, Street, Subdivision/Village, Barangay, ZIP Code)
                          </label>
                          <Input
                            value={isEditing ? editedCrew?.address || "" : crew.address || ""}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            readOnly={!isEditing}
                            className={isEditing ? "border-primary" : ""}
                          />
                        </div> */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Address (House/Unit No., Lot/Block, Street, Subdivision/Village, Barangay, ZIP Code)
                          </label>
                          <Input
                            placeholder="Enter address"
                            value={
                              isEditing ? editedCrew?.address || "" : crew.address || ""
                            }
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.address || editedCrew.address.length < 1)
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.address || editedCrew.address.length < 2) && (
                              <p className="text-red-500 text-sm mt-1">
                                Address is required.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Government IDs Section */}
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-primary">Government IDs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SSS Number */}
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            SSS Number
                          </label>
                          <Input
                            placeholder="Enter SSS number"
                            value={isEditing ? editedCrew?.sssNumber || "" : crew.sssNumber || ""}
                            onChange={(e) => handleInputChange("sssNumber", e.target.value)} // keep dashes/spaces
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  editedCrew?.sssNumber &&
                                  sanitizeDigits(editedCrew.sssNumber).length !== 10
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            editedCrew?.sssNumber &&
                            sanitizeDigits(editedCrew.sssNumber).length !== 10 && (
                              <p className="text-red-500 text-sm mt-1">
                                SSS number should be 10 digits.
                              </p>
                            )}
                        </div>
                        {/* Tax ID Number */}
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Tax ID Number
                          </label>
                          <Input
                            placeholder="Enter Tax ID number"
                            value={isEditing ? editedCrew?.tinNumber || "" : crew.TaxIDNumber || ""}
                            onChange={(e) => handleInputChange("tinNumber", e.target.value)} // keep raw input
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  editedCrew?.tinNumber &&
                                  (sanitizeDigits(editedCrew.tinNumber).length < 9 ||
                                    sanitizeDigits(editedCrew.tinNumber).length > 12)
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            editedCrew?.tinNumber &&
                            (sanitizeDigits(editedCrew.tinNumber).length < 9 ||
                              sanitizeDigits(editedCrew.tinNumber).length > 12) && (
                              <p className="text-red-500 text-sm mt-1">
                                Tax ID should be between 9–12 digits.
                              </p>
                            )}
                        </div>
                        {/* Philhealth Number */}
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Philhealth Number
                          </label>
                          <Input
                            placeholder="Enter Philhealth number"
                            value={
                              isEditing
                                ? editedCrew?.philhealthNumber || ""
                                : crew.philhealthNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange("philhealthNumber", sanitizeDigits(e.target.value))
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  editedCrew?.philhealthNumber &&
                                  sanitizeDigits(editedCrew.philhealthNumber).length !== 12
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            editedCrew?.philhealthNumber &&
                            sanitizeDigits(editedCrew.philhealthNumber).length !== 12 && (
                              <p className="text-red-500 text-sm mt-1">
                                Philhealth number should be 12 characters.
                              </p>
                            )}
                        </div>

                        {/* HDMF Number */}
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            HDMF Number
                          </label>
                          <Input
                            placeholder="Enter HDMF number"
                            value={
                              isEditing
                                ? editedCrew?.hdmfNumber || ""
                                : crew.hdmfNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange("hdmfNumber", sanitizeDigits(e.target.value))
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  editedCrew?.hdmfNumber &&
                                  sanitizeDigits(editedCrew.hdmfNumber).length !== 12
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            editedCrew?.hdmfNumber &&
                            sanitizeDigits(editedCrew.hdmfNumber).length !== 12 && (
                              <p className="text-red-500 text-sm mt-1">
                                HDMF number should be 12 characters.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Travel Documents Section */}
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-primary">
                        Travel Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Passport Number
                          </label>
                          <Input
                            placeholder="Enter passport number"
                            value={
                              isEditing
                                ? editedCrew?.passportNumber || ""
                                : crew.passportNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange("passportNumber", sanitizeAlphanumeric(e.target.value))
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.passportNumber ||
                                    (sanitizeAlphanumeric(editedCrew.passportNumber).length < 7 ||
                                      sanitizeAlphanumeric(editedCrew.passportNumber).length > 9))
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted && isEditing && (!editedCrew?.passportNumber || sanitizeAlphanumeric(editedCrew.passportNumber).length === 0) && (
                            <p className="text-red-500 text-sm mt-1">
                              Passport number is required.
                            </p>
                          )}
                          {submitted &&
                            isEditing &&
                            editedCrew?.passportNumber &&
                            (sanitizeAlphanumeric(editedCrew.passportNumber).length < 7 ||
                              sanitizeAlphanumeric(editedCrew.passportNumber).length > 9) && (
                              <p className="text-red-500 text-sm mt-1">
                                Passport number should be between 7-9 characters.
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Passport Issue Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Passport Issue Date"
                            value={
                              isEditing
                                ? editedCrew?.passportIssueDate
                                  ? new Date(editedCrew.passportIssueDate).toISOString().split("T")[0]
                                  : ""
                                : crew.passportIssueDate
                                  ? new Date(crew.passportIssueDate).toISOString().split("T")[0]
                                  : ""
                            }
                            onChange={(e) =>
                              handleInputChange("passportIssueDate", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.passportIssueDate ||
                                    new Date(editedCrew.passportIssueDate) > new Date())
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.passportIssueDate ||
                              new Date(editedCrew.passportIssueDate) > new Date()) && (
                              <p className="text-red-500 text-sm mt-1">
                                Passport issue date is required and cannot be in the future.
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Passport Expiration Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Passport Expiry Date"
                            value={
                              isEditing
                                ? editedCrew?.passportExpiryDate
                                  ? new Date(editedCrew.passportExpiryDate).toISOString().split("T")[0]
                                  : ""
                                : crew.passportExpiryDate
                                  ? new Date(crew.passportExpiryDate).toISOString().split("T")[0]
                                  : ""
                            }
                            onChange={(e) =>
                              handleInputChange("passportExpiryDate", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.passportExpiryDate ||
                                    (editedCrew?.passportIssueDate &&
                                      new Date(editedCrew.passportExpiryDate) <=
                                      new Date(editedCrew.passportIssueDate)))
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.passportExpiryDate ||
                              (editedCrew?.passportIssueDate &&
                                new Date(editedCrew.passportExpiryDate) <=
                                new Date(editedCrew.passportIssueDate))) && (
                              <p className="text-red-500 text-sm mt-1">
                                Passport expiration date is required and must be after the issue date.
                              </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Seaman Book Number
                          </label>
                          <Input
                            placeholder="Enter Seaman Book number"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookNumber || ""
                                : crew.seamansBookNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange("seamansBookNumber", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.seamansBookNumber ||
                                    (editedCrew.seamansBookNumber &&
                                      (editedCrew.seamansBookNumber.length < 7 ||
                                        editedCrew.seamansBookNumber.length > 9)))
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted && isEditing && !editedCrew?.seamansBookNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              Seaman Book number is required.
                            </p>
                          )}
                          {submitted &&
                            isEditing &&
                            editedCrew?.seamansBookNumber &&
                            (editedCrew.seamansBookNumber.length < 7 ||
                              editedCrew.seamansBookNumber.length > 9) && (
                              <p className="text-red-500 text-sm mt-1">
                                Seaman Book number should be between 7–9 characters.
                              </p>
                            )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Seaman's Book Issue Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Seaman's Book Issue Date"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookIssueDate
                                  ? new Date(editedCrew.seamansBookIssueDate).toISOString().split("T")[0]
                                  : ""
                                : crew.seamansBookIssueDate
                                  ? new Date(crew.seamansBookIssueDate).toISOString().split("T")[0]
                                  : ""
                            }
                            onChange={(e) =>
                              handleInputChange("seamansBookIssueDate", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.seamansBookIssueDate ||
                                    (editedCrew.seamansBookIssueDate &&
                                      editedCrew.seamansBookExpiryDate &&
                                      new Date(editedCrew.seamansBookExpiryDate) <= new Date(editedCrew.seamansBookIssueDate)))
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.seamansBookIssueDate ||
                              (editedCrew.seamansBookIssueDate &&
                                editedCrew.seamansBookExpiryDate &&
                                new Date(editedCrew.seamansBookExpiryDate) <= new Date(editedCrew.seamansBookIssueDate))) && (
                              <p className="text-red-500 text-sm mt-1">
                                Issue date is required and must be before the expiration date.
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 mb-1 block">
                            Seaman's Book Expiration Date
                          </label>
                          <Input
                            type="date"
                            placeholder="Seaman's Book Expiry Date"
                            value={
                              isEditing
                                ? editedCrew?.seamansBookExpiryDate
                                  ? new Date(editedCrew.seamansBookExpiryDate).toISOString().split("T")[0]
                                  : ""
                                : crew.seamansBookExpiryDate
                                  ? new Date(crew.seamansBookExpiryDate).toISOString().split("T")[0]
                                  : ""
                            }
                            onChange={(e) =>
                              handleInputChange("seamansBookExpiryDate", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? `${submitted &&
                                  (!editedCrew?.seamansBookExpiryDate ||
                                    (editedCrew.seamansBookIssueDate &&
                                      editedCrew.seamansBookExpiryDate &&
                                      new Date(editedCrew.seamansBookExpiryDate) <= new Date(editedCrew.seamansBookIssueDate)))
                                  ? "border-red-500 focus:!ring-red-500/50"
                                  : "border-primary"
                                }`
                                : ""
                            }
                          />
                          {submitted &&
                            isEditing &&
                            (!editedCrew?.seamansBookExpiryDate ||
                              (editedCrew.seamansBookIssueDate &&
                                editedCrew.seamansBookExpiryDate &&
                                new Date(editedCrew.seamansBookExpiryDate) <= new Date(editedCrew.seamansBookIssueDate))) && (
                              <p className="text-red-500 text-sm mt-1">
                                Expiration date is required and must be after the issue date.
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
                  <CrewMovement />
                </TabsContent>

                <TabsContent
                  value="allottee"
                  className="p-5 mt-0 overflow-y-auto flex-1"
                >
                  <>
                    <CrewAllottee
                      isEditingAllottee={isEditingAllottee}
                      isAdding={isAddingAllottee}
                      handleSave={handleSave}
                      triggerSave={triggerSave}
                      allotteeLoading={allotteeLoading}
                      setAllotteeLoading={setAllotteeLoading}
                      setTriggerSave={setTriggerSave}
                      setIsEditingAllottee={setIsEditingAllottee}
                      setIsAddingAllottee={setIsAddingAllottee}
                      setIsDeletingAllottee={setIsDeletingAllottee}
                      isAddingAllottee={isAddingAllottee}
                    />
                  </>
                </TabsContent>

                <TabsContent
                  value="validation"
                  className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1"
                >
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-start gap-x-5">
                        <h3 className="text-lg font-semibold mb-4 text-primary">
                          Crew Sign up Details
                        </h3>
                        <div
                          className={`text-sm px-5 mb-4 py-1 ${crewValidationDetails?.IsVerified === 1
                            ? "bg-green-100 text-green-800 border-green-600"
                            : "bg-yellow-100 text-yellow-800 border-yellow-600"
                            } rounded-full border  flex items-center gap-1 flex-shrink-0`}
                        >
                          <p
                            className={`${crewValidationDetails?.IsVerified === 1
                              ? "text-green-800"
                              : "text-yellow-800"
                              }`}
                          >
                            {crewValidationDetails?.IsVerified === 1
                              ? "Verified"
                              : crewValidationDetails?.IsVerified === null
                                ? "Not Registered"
                                : "Pending Verification"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Register Date
                          </label>
                          <Input
                            type="text"
                            className={`${crewValidationDetails?.RegisterDate
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              formatDate(
                                crewValidationDetails?.RegisterDate?.toString()
                              ) || "Not Registered."
                            }
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Verified Date
                          </label>
                          <Input
                            type="text"
                            className={`${crewValidationDetails?.VerificationDate
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              formatDate(
                                crewValidationDetails?.VerificationDate?.toString()
                              ) || "Not Verified."
                            }
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            className={`${crewValidationDetails?.LastName
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.LastName ||
                              "Not Registered"
                            }
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            className={`${crewValidationDetails?.FirstName
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.FirstName ||
                              "Not Registered"
                            }
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            className={`${crewValidationDetails?.MiddleName
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.MiddleName ||
                              "Not Registered"
                            }
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Contact Number
                          </label>
                          <Input
                            className={`${crewValidationDetails?.ContactNumber
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.ContactNumber ||
                              "Not Registered."
                            }
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            className={`${crewValidationDetails?.City ? "" : "text-gray-400"
                              }`}
                            placeholder="Enter city"
                            value={
                              crewValidationDetails?.City || "Not Registered"
                            }
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            className={`${crewValidationDetails?.Province
                              ? ""
                              : "text-gray-400"
                              }`}
                            placeholder="Enter province"
                            value={
                              crewValidationDetails?.Province ||
                              "Not Registered"
                            }
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
                            ID Type
                          </label>
                          <Input
                            className={`${crewValidationDetails?.Documents?.[0]?.IDType
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.Documents?.[0]?.IDType ||
                              "Not Registered"
                            }
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            ID Number
                          </label>
                          <Input
                            className={`${crewValidationDetails?.Documents?.[0]?.IDNumber
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.Documents?.[0]?.IDNumber ||
                              "Not Registered"
                            }
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Issued Date
                          </label>
                          <Input
                            type="text"
                            className={`${crewValidationDetails?.Documents?.[0]?.IDIssueDate
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.Documents?.[0]?.IDIssueDate
                                ? formatDate(
                                  crewValidationDetails.Documents?.[0].IDIssueDate?.toString()
                                )
                                : "Not Registered"
                            }
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
                            className={`${crewValidationDetails?.Documents?.[0]
                              ?.IDExpiryDate
                              ? ""
                              : "text-gray-400"
                              }`}
                            value={
                              crewValidationDetails?.Documents?.[0]
                                ?.IDExpiryDate
                                ? formatDate(
                                  crewValidationDetails.Documents?.[0].IDExpiryDate?.toString()
                                )
                                : "Not Registered"
                            }
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
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            ID Attachment
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">
                              {crewValidationDetails?.Documents?.[0]
                                ?.IDImages?.[0]?.Filename || "Not Uploaded"}
                            </h4>
                            <div
                              className="w-64 h-40 overflow-hidden rounded cursor-pointer mx-auto"
                              onClick={() => {
                                const imageData =
                                  crewValidationDetails?.Documents?.[0]
                                    ?.IDImages?.[0];
                                if (
                                  imageData?.FileContent &&
                                  imageData?.ContentType
                                ) {
                                  const fullDataUrl = `data:${imageData.ContentType};base64,${imageData.FileContent}`;
                                  openModal(fullDataUrl);
                                }
                              }}
                            >
                              {crewValidationDetails?.Documents?.[0]
                                ?.IDImages?.[0]?.FileContent ? (
                                <Base64Image
                                  width={256}
                                  height={160}
                                  imageType={
                                    crewValidationDetails?.Documents?.[0]
                                      ?.IDImages?.[0]?.ContentType
                                  }
                                  alt="ID Attachment"
                                  base64String={
                                    crewValidationDetails?.Documents?.[0]
                                      ?.IDImages?.[0]?.FileContent
                                  }
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <Image
                                    src="/placeholder.png"
                                    alt="No Image Available"
                                    width={256}
                                    height={160}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            <p className="flex justify-end text-xs text-gray-500 text-center mt-2">
                              {crewValidationDetails?.Documents?.[0]
                                ?.IDImages?.[0]?.FileContent ? (
                                <>
                                  Uploaded &middot;{" "}
                                  {formatDayMonthYear(
                                    crewValidationDetails?.RegisterDate?.toString()
                                  )}
                                </>
                              ) : (
                                "Not Uploaded"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* selfiewithID */}
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Selfie with ID Attachment
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            {crewValidationDetails?.Documents?.[0]?.IDImages &&
                              crewValidationDetails.Documents[0].IDImages.length >
                              1 ? (
                              <>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">
                                  {currentSelfieIndex + 1} of{" "}
                                  {crewValidationDetails.Documents[0].IDImages
                                    .length - 1}{" "}
                                  Selfie with ID Image/s
                                </h4>
                                <div className="relative">
                                  <div
                                    className="w-64 h-40 overflow-hidden rounded cursor-pointer mx-auto"
                                    onClick={() => {
                                      const imageData =
                                        crewValidationDetails?.Documents?.[0]
                                          ?.IDImages?.[currentSelfieIndex + 1];
                                      if (
                                        imageData?.FileContent &&
                                        imageData?.ContentType
                                      ) {
                                        const fullDataUrl = `data:${imageData.ContentType};base64,${imageData.FileContent}`;
                                        openModal(fullDataUrl);
                                      }
                                    }}
                                  >
                                    {crewValidationDetails?.Documents?.[0]
                                      ?.IDImages?.[currentSelfieIndex + 1]
                                      ?.FileContent ? (
                                      <Base64Image
                                        width={256}
                                        height={160}
                                        imageType={
                                          crewValidationDetails.Documents[0]
                                            .IDImages[currentSelfieIndex + 1]
                                            ?.ContentType || "image/jpeg"
                                        }
                                        alt={`Selfie with ID ${currentSelfieIndex + 1
                                          }`}
                                        base64String={
                                          crewValidationDetails.Documents[0]
                                            .IDImages[currentSelfieIndex + 1]
                                            ?.FileContent
                                        }
                                        className="object-cover w-full h-full transition-transform hover:scale-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <p className="text-gray-400">
                                          Image not available
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {crewValidationDetails?.Documents?.[0]
                                    ?.IDImages &&
                                    crewValidationDetails.Documents[0].IDImages
                                      .length > 2 && (
                                      <>
                                        <button
                                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const totalImages =
                                              (crewValidationDetails
                                                ?.Documents?.[0]?.IDImages
                                                ?.length || 0) - 1;
                                            setCurrentSelfieIndex((prev) =>
                                              prev === 0
                                                ? Math.max(0, totalImages - 1)
                                                : prev - 1
                                            );
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 19l-7-7 7-7"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const totalImages =
                                              (crewValidationDetails
                                                ?.Documents?.[0]?.IDImages
                                                ?.length || 0) - 1;
                                            setCurrentSelfieIndex((prev) =>
                                              prev ===
                                                Math.max(0, totalImages - 1)
                                                ? 0
                                                : prev + 1
                                            );
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </button>
                                      </>
                                    )}

                                  {crewValidationDetails?.Documents?.[0]
                                    ?.IDImages &&
                                    crewValidationDetails.Documents[0].IDImages
                                      .length > 2 && (
                                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                        {Array.from({
                                          length: Math.max(
                                            0,
                                            (crewValidationDetails.Documents[0]
                                              .IDImages.length || 0) - 1
                                          ),
                                        }).map((_, index) => (
                                          <button
                                            key={index}
                                            className={`h-2 w-2 rounded-full ${currentSelfieIndex === index
                                              ? "bg-blue-500"
                                              : "bg-gray-300"
                                              }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCurrentSelfieIndex(index);
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                </div>
                                <p className="flex justify-end text-xs text-gray-500 text-center mt-2">
                                  Uploaded &middot;{" "}
                                  {formatDayMonthYear(
                                    crewValidationDetails?.RegisterDate?.toString()
                                  ) || "Not Registered"}
                                </p>
                              </>
                            ) : (
                              <>
                                <h4 className="text-sm font-medium text-gray-800 mb-2">
                                  No selfie images uploaded
                                </h4>
                                <div className="w-64 h-40 overflow-hidden rounded mx-auto bg-gray-100 flex items-center justify-center">
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Image
                                      src="/placeholder.png"
                                      alt="No Image Available"
                                      width={256}
                                      height={160}
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                                <p className="flex justify-end text-xs text-gray-500 text-center mt-2">
                                  Not uploaded
                                </p>
                              </>
                            )}
                          </div>
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

      <ImageModal
        modalImage={modalImage}
        zoom={zoom}
        closeModal={closeModal}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </div>
  );
}