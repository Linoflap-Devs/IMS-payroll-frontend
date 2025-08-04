import { useState, useEffect } from "react";
import { useCrewStore } from "@/src/store/useCrewStore";
import { Crew, mapMaritalStatus, mapGender } from "@/types/crew";
import { updateCrew } from "../services/crew/crew.api";
import { toast } from "@/components/ui/use-toast";
import { add } from "date-fns";

export function useCrewDetails(crewId: string | null) {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [editedCrew, setEditedCrew] = useState<Crew | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const {
    crewDetails,
    isLoadingDetails,
    detailsError,
    fetchCrewDetails,
    resetDetails,
    crewBasic,
    isLoadingBasic,
    basicError,
    fetchCrewBasic,
    resetBasic,
    crewValidationDetails,
    isLoadingValidationDetails,
    fetchCrewValidationDetails,
    isCrewVerified,
  } = useCrewStore();

  useEffect(() => {
    if (crewId) {
      fetchCrewDetails(crewId);
      fetchCrewBasic(crewId);
      fetchCrewValidationDetails(crewId);
    }
    return () => {
      resetDetails();
      resetBasic();
    };
  }, [
    crewId,
    fetchCrewDetails,
    resetDetails,
    fetchCrewBasic,
    resetBasic,
    fetchCrewValidationDetails,
  ]);

  useEffect(() => {
    if (crewDetails && crewBasic) {
      const mappedCrew = {
        id: crewBasic.CrewCode,
        rank: crewBasic.Rank,
        status: crewBasic.CrewStatusID === 1 ? "On board" : "Off board",
        email: crewBasic.EmailAddress,
        phone: crewBasic.MobileNo,
        landline: crewBasic.LandLineNo, // Fixed casing from LandlineNo to LandLineNo
        vessel: crewBasic.Vessel,

        firstName: crewDetails.FirstName,
        lastName: crewDetails.LastName,
        middleName: crewDetails.MiddleName,
        name: `${crewDetails.FirstName} ${crewDetails.LastName}`,
        maritalStatus: mapMaritalStatus(crewDetails.MaritalStatus),
        sex: mapGender(crewDetails.Gender),
        dateOfBirth: crewDetails.Birthday,
        city: crewDetails.City,
        province: crewDetails.Province,
        address: crewDetails.HomeAddress,
        sssNumber: crewDetails.SSSNumber,
        taxIdNumber: crewDetails.TaxIDNumber,
        philhealthNumber: crewDetails.PhilhealthNumber,
        hdmfNumber: crewDetails.HDMFNumber,
        passportNumber: crewDetails.PassportNumber,
        passportIssueDate: crewDetails.PassPortIssueDate,
        passportExpiryDate: crewDetails.PassPortExpiredDate,
        seamansBookNumber: crewDetails.SRIBNumber,
        seamansBookIssueDate: crewDetails.SRIBIssueDate,
        seamansBookExpiryDate: crewDetails.SRIBExpiredDate,
        crewPhoto: crewDetails.crewPhoto, // include this explicitly
        ProfileImage: crewDetails.ProfileImage,
      };

      setCrew(mappedCrew);
      setEditedCrew(mappedCrew);
    } 
  }, [crewDetails, crewBasic]);

  const toggleEditMode = () => {
    if (isEditing) {
      setEditedCrew(crew);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    if (!editedCrew || !editedCrew.id) {
      console.warn("Cannot save. editedCrew or editedCrew.id is missing");
      return;
    }

    //console.log("Starting saveChanges...");
    setIsEditLoading(true);

    const updatedCrew = {
      ...editedCrew,
      name: `${editedCrew.firstName} ${editedCrew.lastName}`,
    };
    //console.log("updatedCrew object:", updatedCrew);

    const crewToBeUpdated = {
      status: updatedCrew.status,
      emailAddress: updatedCrew.email,
      mobileNumber: updatedCrew.phone,
      landlineNumber: updatedCrew.landline || undefined,

      firstName: updatedCrew.firstName,
      lastName: updatedCrew.lastName,
      middleName: updatedCrew.middleName ? updatedCrew.middleName : undefined,
      maritalStatus:
        updatedCrew?.maritalStatus === "single"
          ? "1"
          : updatedCrew?.maritalStatus === "married"
          ? "2"
          : updatedCrew?.maritalStatus === "divorced"
          ? "3"
          : updatedCrew?.maritalStatus === "widowed"
          ? "4"
          : "0",
      sex:
        updatedCrew?.sex === "male"
          ? "1"
          : updatedCrew?.sex === "female"
          ? "2"
          : updatedCrew?.sex === "other"
          ? "3"
          : "0",
      dateOfBirth: updatedCrew.dateOfBirth,
      city: updatedCrew.city,
      province: updatedCrew.province,
      address: updatedCrew.address,
      sssNumber: updatedCrew.sssNumber,
      philhealthNumber: updatedCrew.philhealthNumber,
      taxIdNumber: updatedCrew.taxIdNumber,
      hdmfNumber: updatedCrew.hdmfNumber,
      passportNumber: updatedCrew.passportNumber,
      passportIssueDate: updatedCrew.passportIssueDate,
      passportExpiryDate: updatedCrew.passportExpiryDate,
      seamanBookNumber: updatedCrew.seamansBookNumber,
      seamanBookIssueDate: updatedCrew.seamansBookIssueDate,
      seamanBookExpiryDate: updatedCrew.seamansBookExpiryDate,
      crewPhoto:
        updatedCrew.crewPhoto instanceof File
          ? updatedCrew.crewPhoto
          : undefined,
    };

    //console.log("Data to be sent to API (crewToBeUpdated):", crewToBeUpdated);

    try {
      const response = await updateCrew(editedCrew.id, crewToBeUpdated);

      //console.log("Response from updateCrew:", response);

      if (response.success) {
        //console.log("Refetching crew data...");
        await Promise.all([
          fetchCrewBasic(editedCrew.id),
          fetchCrewDetails(editedCrew.id),
        ]);

        //console.log("Crew data updated and refetched.");

        toast({
          title: "Success",
          description: "Crew details updated successfully.",
          variant: "success",
        });
      } else {
        console.warn("API responded with failure:", response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to update crew details.",
          variant: "destructive",
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Exception caught during API call:", error);
      toast({
        title: "Error",
        description: "Failed to update crew details.",
        variant: "destructive",
      });
    } finally {
      //console.log("Cleaning up... set loading to false.");
      setIsEditLoading(false);
    }
  };

  // const handleInputChange = (field: keyof Crew, value: string) => {
  //   setEditedCrew((prev) => {
  //     const updated = {
  //       ...prev,
  //       [field]: value,
  //     };
  //     return updated;
  //   });
  // };

  const handleInputChange = <K extends keyof Crew>(field: K, value: Crew[K]) => {
    setEditedCrew((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  return {
    crew,
    editedCrew,
    isLoading: isLoadingDetails || isLoadingBasic,
    error: detailsError || basicError,
    isEditing,
    setIsEditing,
    handleInputChange,
    saveChanges,
    toggleEditMode,
    setEditedCrew,
    isEditLoading,
    crewValidationDetails,
    isLoadingValidationDetails,
    isCrewVerified,
    crewBasic,
  };
}
