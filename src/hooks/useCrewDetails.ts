import { useState, useEffect } from "react";
import { useCrewStore } from "@/src/store/useCrewStore";
import { Crew, mapMaritalStatus, mapGender, formatDate } from "@/types/crew";
import { updateCrew } from "../services/crew/crew.api";
import { toast } from "@/components/ui/use-toast";

export function useCrewDetails(crewId: string | null) {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [editedCrew, setEditedCrew] = useState<Crew | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    resetBasic
  } = useCrewStore();

  useEffect(() => {
    if (crewId) {
      fetchCrewDetails(crewId);
      fetchCrewBasic(crewId);
    }
    return () => {
      resetDetails();
      resetBasic();
    };
  }, [crewId, fetchCrewDetails, resetDetails, fetchCrewBasic, resetBasic]);

  useEffect(() => {
    if (crewDetails && crewBasic) {
      const mappedCrew = {
        id: crewBasic.CrewCode,
        rank: crewBasic.Rank,
        status: crewBasic.CrewStatusID === 1 ? "On board" : "Off board",
        email: crewBasic.EmailAddress,
        phone: crewBasic.MobileNo,
        landline: crewBasic.LandLineNo, // Fixed casing from LandlineNo to LandLineNo
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
        philhealthNumber: "", // Temporarily set to empty string until backend adds the field
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
  }, [crewDetails, crewBasic]);

  const toggleEditMode = () => {
    if (isEditing) {
      setEditedCrew(crew);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    if (!editedCrew || !editedCrew.id) return;

    const updatedCrew = {
      ...editedCrew,
      name: `${editedCrew.firstName} ${editedCrew.lastName}`,
    };

    const crewToBeUpdated = {
      status: updatedCrew.status,
      email: updatedCrew.email,
      phone: updatedCrew.phone,
      landline: updatedCrew.landline,
      firstName: updatedCrew.firstName,
      lastName: updatedCrew.lastName,
      middleName: updatedCrew.middleName,
      maritalStatus: updatedCrew.maritalStatus,
      sex: updatedCrew.sex,
      dateOfBirth: updatedCrew.dateOfBirth,
      city: updatedCrew.city,
      province: updatedCrew.province,
      sssNumber: updatedCrew.sssNumber,
      // philhealthNumber: "", // Temporarily set to empty string until backend adds the field
      hdmfNumber: updatedCrew.hdmfNumber,
      passportNumber: updatedCrew.passportNumber,
      passportIssueDate: updatedCrew.passportIssueDate,
      passportExpiryDate: updatedCrew.passportExpiryDate,
      seamansBookNumber: updatedCrew.seamansBookNumber,
      seamansBookIssueDate: updatedCrew.seamansBookIssueDate,
      seamansBookExpiryDate: updatedCrew.seamansBookExpiryDate,
    }

    setCrew(updatedCrew);
    setEditedCrew(updatedCrew);
    setIsEditing(false);

    console.log("Crew details saved:", crew);
    console.log("Crew to be updated:", crewToBeUpdated);

    const response = await updateCrew(editedCrew.id, crewToBeUpdated);
    if (response.success) {
      toast({
        title: "Success",
        // description: response.message || "Crew details updated successfully.",
        description: "Crew details updated successfully.",
        variant: "success",
      });
    }

    console.log("Response from updateCrew:", response);
  };

  const handleInputChange = (field: keyof Crew, value: string) => {
    setEditedCrew(prev => ({
      ...prev,
      [field]: value,
    }));
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
  };
}