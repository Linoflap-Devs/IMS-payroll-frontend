"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { formatDate } from "@/types/crew";
import Image from "next/image";
import AddCrewAllottee from "./crew/AddCrewAllottee";

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

  // delete allottee
  const [triggerDelete, setTriggerDelete] = useState(false);
  const [isDeletingAllottee, setIsDeletingAllottee] = useState(false);

  const [triggerAdd, setTriggerAdd] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);

  const handleTriggerAdd = () => {
    setTriggerAdd((prev) => !prev);
  };

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
  } = useCrewDetails(crewId);

  const handleSave = () => {
    setTriggerSave((prev) => !prev);
  };

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

    console.log("Query params:", tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "movement" || value === "allottee") {
      setIsEditing(false);
    }

    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);

    window.history.pushState({}, "", url.toString());
  };

  const toggleAllotteeEdit = () => {
    setIsEditingAllottee(!isEditingAllottee);
  };

  const toggleAllotteeAdd = () => {
    setIsAddingAllottee(!isAddingAllottee);
  };

  const handleDeleteAllottee = () => {
    setTriggerDelete((prev) => !prev);
  };

  const handleDelete = (selectedAllottee: string) => {
    console.log("Deleting allottee:", selectedAllottee);
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
          isEditing={isEditing}
          activeTab={activeTab}
          toggleEditMode={toggleEditMode}
          saveChanges={saveChanges}
          isEditingAllottee={isEditingAllottee}
          toggleAllotteeEdit={toggleAllotteeEdit}
          handleDelete={handleDelete}
          toggleAllotteeAdd={toggleAllotteeAdd}
          isAddingAllottee={isAddingAllottee}
          handleSave={handleSave}
          allotteeLoading={allotteeLoading}
          handleDeleteAllottee={handleDeleteAllottee}
          handleTriggerAdd={handleTriggerAdd}
          isAddLoading={isAddLoading}
          isDeletingAllottee={isDeletingAllottee}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CrewSidebar
            crew={crew}
            isEditing={isEditing}
            editedCrew={editedCrew}
          />

          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full flex flex-col h-full">
                <div className="border-b">
                  <div className="px-4 pt-1">
                    <TabsList className="bg-transparent p-0 h-8 w-full flex justify-between space-x-0">
                      <TabsTrigger
                        value="details"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        Crew Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="movement"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        Crew Movement
                      </TabsTrigger>
                      <TabsTrigger
                        value="allottee"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        View Allottee
                      </TabsTrigger>
                      <TabsTrigger
                        value="validation"
                        className="flex-1 px-0 pb-4 h-full text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer">
                        Account Validation
                      </TabsTrigger>
                    </TabsList>
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
                            value={
                              isEditing
                                ? editedCrew?.lastName || ""
                                : crew.lastName || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.firstName || ""
                                : crew.firstName || ""
                            }
                            onChange={(e) =>
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
                          <label className="text-sm text-gray-500 mb-1 block">
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
                            disabled={!isEditing}>
                            <SelectTrigger
                              className={isEditing ? "border-primary" : ""}>
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
                              isEditing ? editedCrew?.sex || "" : crew.sex || ""
                            }
                            onValueChange={(value) =>
                              handleInputChange("sex", value)
                            }
                            disabled={!isEditing}>
                            <SelectTrigger
                              className={isEditing ? "border-primary" : ""}>
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
                                ? editedCrew?.dateOfBirth || ""
                                : formatDate(crew.dateOfBirth) || ""
                            }
                            onChange={(e) =>
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
                              isEditing
                                ? editedCrew?.city || ""
                                : crew.city || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.province || ""
                                : crew.province || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.sssNumber || ""
                                : crew.sssNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.taxIdNumber || ""
                                : crew.taxIdNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.philhealthNumber || ""
                                : crew.philhealthNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.hdmfNumber || ""
                                : crew.hdmfNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.passportNumber || ""
                                : crew.passportNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.passportIssueDate || ""
                                : formatDate(crew.passportIssueDate) || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.passportExpiryDate || ""
                                : formatDate(crew.passportExpiryDate) || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.seamansBookNumber || ""
                                : crew.seamansBookNumber || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.seamansBookIssueDate || ""
                                : formatDate(crew.seamansBookIssueDate) || ""
                            }
                            onChange={(e) =>
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
                                ? editedCrew?.seamansBookExpiryDate || ""
                                : formatDate(crew.seamansBookExpiryDate) || ""
                            }
                            onChange={(e) =>
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
                  className="p-4 mt-0 overflow-y-auto scrollbar-hide flex-1">
                  <CrewMovement />
                </TabsContent>

                <TabsContent
                  value="allottee"
                  className="p-5 mt-0 overflow-y-auto scrollbar-hide flex-1">

                  {!isAddingAllottee ? (
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
                        triggerDelete={triggerDelete}
                        setTriggerDelete={setTriggerDelete}
                        setIsDeletingAllottee={setIsDeletingAllottee}
                      />
                    </>
                  ) : (
                    <>
                      <AddCrewAllottee
                        triggerAdd={triggerAdd}
                        setIsAddingAllottee={setIsAddingAllottee}
                        setTriggerAdd={setTriggerAdd}
                        // isAddLoading={isAddLoading}
                        setIsAddLoading={setIsAddLoading}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent
                  value="validation"
                  className="p-6 mt-0 overflow-y-auto scrollbar-hide flex-1">
                  <div className="space-y-8">
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
                            value={formatDate(crew.registerDate)}
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
                            value={formatDate(crew.verifyDate)}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Last Name
                          </label>
                          <Input
                            placeholder="Enter last name"
                            value={crew.lastName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            First Name
                          </label>
                          <Input
                            placeholder="Enter first name"
                            value={crew.firstName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Middle Name
                          </label>
                          <Input
                            placeholder="Enter middle name"
                            value={crew.middleName || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Contact Number
                          </label>
                          <Input
                            placeholder="Enter a Number"
                            value={crew.phone || ""}
                            readOnly
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            City
                          </label>
                          <Input
                            placeholder="Enter city"
                            value={crew.city || ""}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Province
                          </label>
                          <Input
                            placeholder="Enter province"
                            value={crew.province || ""}
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
                            value={crew.selectedFile || ""}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">
                            Number
                          </label>
                          <Input
                            placeholder="Enter File Number"
                            value={crew.fileNumber || ""}
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
                            value={formatDate(crew.issuedDate)}
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
                            value={formatDate(crew.expirationDate)}
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
                              sampleimagename.jpg
                            </h4>
                            <div
                              className="w-64 h-40 overflow-hidden rounded cursor-pointer mx-auto"
                              onClick={() => openModal("/placeholder.png")}>
                              <Image
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
                              onClick={() => openModal("/placeholder.png")}>
                              <Image
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
