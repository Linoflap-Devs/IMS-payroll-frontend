import { useState, useEffect } from "react";
import { useCrewStore } from "@/src/store/useCrewStore";
import { Crew, mapMaritalStatus, mapGender, formatDate } from "@/types/crew";

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

  const saveChanges = () => {
    if (!editedCrew) return;
    
    const updatedCrew = {
      ...editedCrew,
      name: `${editedCrew.firstName} ${editedCrew.lastName}`,
    };

    setCrew(updatedCrew);
    setEditedCrew(updatedCrew);
    setIsEditing(false);
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