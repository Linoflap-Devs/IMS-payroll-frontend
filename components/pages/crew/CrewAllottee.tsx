"use client";

import {
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { useCrewStore } from "@/src/store/useCrewStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/src/store/useLocationStore";
import { useBankStore } from "@/src/store/useBankStore";
import { useRelationshipStore } from "@/src/store/useRelationshipStore";
import { AllotteeUiModel, AllotteeApiModel } from "@/types/crewAllottee";
import {
  deleteCrewAllottee,
  updateCrewAllottee,
} from "@/src/services/crew/crewAllottee.api";
import { toast } from "@/components/ui/use-toast";
import { useAllotteeFormStore } from "@/src/store/useAllotteeFormStore";
import React from "react";

// Empty UI model for initialization
const emptyAllottee: AllotteeUiModel = {
  id: "",
  name: "",
  relationship: "",
  relationshipId: "",
  contactNumber: "",
  address: "",
  city: "",
  cityId: "",
  province: "",
  provinceId: "",
  bankName: "",
  bankId: "",
  bankBranch: "",
  branchId: "",
  accountNumber: "",
  allotment: 0,
  active: 0,
  priority: 0,
  receivePayslip: 0,
  allotmentType: 1,
  allotteeDetailID: "",
};

interface ICrewAllotteeProps {
  onAdd?: () => void;
  isEditingAllottee?: boolean;
  isAdding?: boolean;
  onSave?: (allottee: AllotteeApiModel) => void;
  onCancel?: () => void;
  handleSave: () => void;
  triggerSave: boolean;
  allotteeLoading?: boolean;
  setAllotteeLoading: Dispatch<SetStateAction<boolean>>;
  setTriggerSave: Dispatch<SetStateAction<boolean>>;
  setIsEditingAllottee?: Dispatch<SetStateAction<boolean>>;
  triggerDelete: boolean;
  setTriggerDelete: Dispatch<SetStateAction<boolean>>;
  setIsDeletingAllottee: Dispatch<SetStateAction<boolean>>;
}

export function CrewAllottee({
  isEditingAllottee = false,
  isAdding = false,
  triggerSave,
  setAllotteeLoading,
  setTriggerSave,
  setIsEditingAllottee = () => {},
  setTriggerDelete,
  triggerDelete,
  setIsDeletingAllottee,
}: ICrewAllotteeProps) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<AllotteeUiModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("0");
  const [currentAllottee, setCurrentAllottee] =
    useState<AllotteeUiModel | null>(null);
  const [editingAllottee, setEditingAllottee] =
    useState<AllotteeUiModel | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchProvince, setSearchProvince] = useState("");
  const [previousAllotteeId, setPreviousAllotteeId] = useState<string>("");
  const { isAllotteeValid, setIsAllotteeValid } = useAllotteeFormStore();

  const {
    allottees: storeAllottees,
    isLoadingAllottees,
    allotteesError,
    fetchCrewAllottees,
    resetAllottees,
  } = useCrewStore();

  const {
    fetchBanks,
    setSelectedBankId,
    setSelectedBranchId,
    getUniqueBanks,
    getBranchesForSelectedBank,
  } = useBankStore();

  const { allRelationshipData, fetchRelationships } = useRelationshipStore();
  const { loading, cities, provinces, fetchCities, fetchProvinces } =
    useLocationStore();

  useEffect(() => {
    if (!crewId) return;
    fetchCrewAllottees(crewId);
    return () => {
      resetAllottees();
    };
  }, [crewId, fetchCrewAllottees, resetAllottees]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const uniqueBanks = getUniqueBanks();
  const branchesForSelectedBank = getBranchesForSelectedBank();

  const handleBankChange = (value: string) => {
    if (!editingAllottee) return;

    const selectedBank = uniqueBanks.find((b) => b.BankID.toString() === value);

    setEditingAllottee({
      ...editingAllottee,
      bankId: value,
      bankName: selectedBank?.BankName || "",
      branchId: "",
      bankBranch: "",
    });

    setSelectedBankId(Number(value));
  };

  const handleBranchChange = (value: string) => {
    if (!editingAllottee) return;

    const selectedBranch = branchesForSelectedBank.find(
      (b) => b.BankBranchID.toString() === value
    );

    setEditingAllottee({
      ...editingAllottee,
      branchId: value,
      bankBranch: selectedBranch?.BankBranchName || "",
    });

    setSelectedBranchId(Number(value));
  };

  useEffect(() => {
    const mapped = storeAllottees.map((a) => ({
      id: a.AllotteeDetailID,
      name: a.AllotteeName,
      relationship: a.RelationName,
      relationshipId: a.RelationID?.toString() || "",
      contactNumber: a.ContactNumber,
      address: a.Address,
      province: a.ProvinceName,
      provinceId: a.ProvinceID?.toString() || "",
      city: a.CityName,
      cityId: a.CityID?.toString() || "",
      bankName: a.BankName,
      bankId: a.BankID?.toString() || "",
      bankBranch: a.BankBranch,
      branchId: a.BankBranchID?.toString() || "",
      accountNumber: a.AccountNumber,
      allotment: a.Allotment,
      
      priority: a.priority ? 1 : 0,
      receivePayslip: a.receivePayslip ? 1 : 0,
      active: a.active ? 1 : 0,

      allotmentType: a.AllotmentType,
      allotteeDetailID: a.AllotteeDetailID,
    }));

    setAllottees(mapped);

    if (previousAllotteeId) {
      const previousIndex = mapped.findIndex(
        (a) => a.id === previousAllotteeId
      );
      if (previousIndex >= 0) {
        setSelectedIndex(previousIndex.toString());
      } else {
        setSelectedIndex("0");
      }
    } else {
      setSelectedIndex("0");
    }
  }, [storeAllottees, previousAllotteeId]);

  useEffect(() => {
    if (allottees.length > 0 && selectedIndex) {
      const index = parseInt(selectedIndex, 10);
      if (index < allottees.length) {
        setPreviousAllotteeId(allottees[index].id);
      }
    }
  }, [selectedIndex, allottees]);

  useEffect(() => {
    if (isAdding) {
      setCurrentAllottee(emptyAllottee);
      setEditingAllottee(emptyAllottee);
    } else if (allottees.length > 0) {
      const index = parseInt(selectedIndex, 10);
      setCurrentAllottee({ ...allottees[index] });

      if (isEditingAllottee) {
        setEditingAllottee({ ...allottees[index] });

        if (allottees[index].bankId) {
          setSelectedBankId(Number(allottees[index].bankId));
        }
        if (allottees[index].branchId) {
          setSelectedBranchId(Number(allottees[index].branchId));
        }
      }
    } else {
      setCurrentAllottee(null);
      setEditingAllottee(null);
    }
  }, [
    selectedIndex,
    allottees,
    isAdding,
    isEditingAllottee,
    setSelectedBankId,
    setSelectedBranchId,
  ]);

  useEffect(() => {
    fetchCities();
    fetchProvinces();
  }, [fetchCities, fetchProvinces]);

  const lastProcessedIndexRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      isEditingAllottee &&
      allottees.length > 0 &&
      selectedIndex !== lastProcessedIndexRef.current
    ) {
      const index = parseInt(selectedIndex, 10);
      const allottee = { ...allottees[index] };
      let needsUpdate = false;

      if (allottee.relationship && !allottee.relationshipId) {
        const relation = allRelationshipData.find(
          (r) => r.RelationName === allottee.relationship
        );
        if (relation) {
          allottee.relationshipId = relation.RelationID.toString();
          needsUpdate = true;
        }
      }

      if (allottee.province && !allottee.provinceId) {
        const province = provinces.find(
          (p) => p.ProvinceName === allottee.province
        );
        if (province) {
          allottee.provinceId = province.ProvinceID.toString();
          needsUpdate = true;
        }
      }

      if (allottee.city && !allottee.cityId && allottee.provinceId) {
        const city = cities.find(
          (c) =>
            c.CityName === allottee.city &&
            c.ProvinceID === parseInt(allottee.provinceId)
        );
        if (city) {
          allottee.cityId = city.CityID.toString();
          needsUpdate = true;
        }
      }

      if (allottee.bankName && !allottee.bankId) {
        const bank = uniqueBanks.find((b) => b.BankName === allottee.bankName);
        if (bank) {
          allottee.bankId = bank.BankID.toString();
          setSelectedBankId(bank.BankID);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        setEditingAllottee(allottee);
      }

      lastProcessedIndexRef.current = selectedIndex;
    }
  }, [
    isEditingAllottee,
    allottees,
    selectedIndex,
    allRelationshipData,
    provinces,
    cities,
    uniqueBanks,
    setSelectedBankId,
  ]);

  useEffect(() => {
    if (
      isEditingAllottee &&
      editingAllottee &&
      editingAllottee.bankId &&
      !editingAllottee.branchId
    ) {

      // Set the selected bank ID in the store
      setSelectedBankId(Number(editingAllottee.bankId));

      // Wait a bit for branches to load and then find the matching branch
      setTimeout(() => {
        const branches = getBranchesForSelectedBank();

        // If we have a branch name but no ID, find it
        if (editingAllottee.bankBranch && branches.length > 0) {
          const matchingBranch = branches.find(
            (b) => b.BankBranchName === editingAllottee.bankBranch
          );

          if (matchingBranch) {

            // Update the allottee with the branch ID
            setEditingAllottee({
              ...editingAllottee,
              branchId: matchingBranch.BankBranchID.toString(),
            });

            // Also update the branch in the store
            setSelectedBranchId(matchingBranch.BankBranchID);
          }
        }
      }, 100); // Small delay to ensure branches are loaded
    }
  }, [
    isEditingAllottee,
    editingAllottee?.bankId,
    getBranchesForSelectedBank,
    setSelectedBankId,
    setSelectedBranchId,
    editingAllottee,
  ]);

  useEffect(() => {
    if (!isEditingAllottee) {
      lastProcessedIndexRef.current = null;
    }
  }, [isEditingAllottee]);

  const filteredCities = useMemo(() => {
    if (!editingAllottee || !editingAllottee.provinceId) {
      return [];
    }

    const provinceId = parseInt(editingAllottee.provinceId);
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceId
    );

    if (!searchCity.trim()) {
      return citiesInProvince.slice(0, 50);
    }

    return citiesInProvince
      .filter((city) =>
        city.CityName.toLowerCase().includes(searchCity.toLowerCase())
      )
      .slice(0, 100);
  }, [cities, searchCity, editingAllottee]);

  const filteredProvinces = useMemo(() => {
    if (!searchProvince.trim()) {
      return provinces;
    }
    return provinces.filter((province) =>
      province.ProvinceName.toLowerCase().includes(searchProvince.toLowerCase())
    );
  }, [provinces, searchProvince]);

  const handleInputChange = (field: keyof AllotteeUiModel, value: unknown) => {
    if (!editingAllottee) return;

    setEditingAllottee({
      ...editingAllottee,
      [field]: value,
    });
  };

  const handleCityChange = (cityId: string) => {
    if (!editingAllottee) return;

    const selectedCity = cities.find((c) => c.CityID.toString() === cityId);

    setEditingAllottee({
      ...editingAllottee,
      cityId: cityId,
      city: selectedCity?.CityName || "",
    });
  };

  const handleProvinceChange = (provinceId: string) => {
    if (!editingAllottee) return;

    const selectedProvince = provinces.find(
      (p) => p.ProvinceID.toString() === provinceId
    );

    setEditingAllottee({
      ...editingAllottee,
      provinceId: provinceId,
      province: selectedProvince?.ProvinceName || "",
      cityId: "",
      city: "",
    });
  };

  const handleRelationshipChange = (relationId: string) => {
    if (!editingAllottee) return;

    const selectedRelation = allRelationshipData.find(
      (r) => r.RelationID.toString() === relationId
    );

    setEditingAllottee({
      ...editingAllottee,
      relationshipId: relationId,
      relationship: selectedRelation?.RelationName || "",
    });
  };

  const convertToApiModel = (uiModel: AllotteeUiModel): AllotteeApiModel => {
    return {
      id: uiModel.id,
      name: uiModel.name,
      allotmentType: uiModel.allotmentType,
      relation: uiModel.relationshipId ? parseInt(uiModel.relationshipId) : 0,
      contactNumber: uiModel.contactNumber,
      address: uiModel.address,
      city: uiModel.cityId ? parseInt(uiModel.cityId) : 0,
      province: uiModel.provinceId ? parseInt(uiModel.provinceId) : 0,
      bank: uiModel.bankId ? parseInt(uiModel.bankId) : 0,
      branch: uiModel.branchId ? parseInt(uiModel.branchId) : 0,
      accountNumber: uiModel.accountNumber,
      allotment: uiModel.allotment,
      priority: uiModel.priority ? 1 : 0,
      receivePayslip: uiModel.receivePayslip ? 1 : 0,
      active: uiModel.active ? 1 : 0,
      allotteeDetailID: uiModel.allotteeDetailID,
    };
  };

  useEffect(() => {
    if (triggerSave) {

      setAllotteeLoading(true);

      if (!editingAllottee || !crewId) {
        setAllotteeLoading(false);
        return;
      }

      try {
        const apiModel = convertToApiModel(editingAllottee!);
        updateCrewAllottee(crewId.toString(), apiModel)
          .then((response) => {
            toast({
              title: "Allottee saved successfully",
              description: `Allottee ${editingAllottee?.name} has been updated.`,
              variant: "success",
            });
            setTriggerSave(false);
            fetchCrewAllottees(crewId.toString());
          })
          .catch((error) => {
            console.error("Error saving allottee:", error);
            toast({
              title: "Error saving allottee",
              description: "There was an error saving the allottee.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setAllotteeLoading(false);
            setTriggerSave(false);
            setIsEditingAllottee(false);
          });
      } catch (error) {
        console.error("Unexpected error saving allottee:", error);
        setAllotteeLoading(false);
        setTriggerSave(false);
      }
    }
  }, [
    triggerSave,
    crewId,
    editingAllottee,
    setAllotteeLoading,
    setTriggerSave,
    fetchCrewAllottees,
    setIsEditingAllottee,
  ]);

  useEffect(() => {
    if (triggerSave) {
      setAllotteeLoading(true);
      //console.log(editingAllottee);
      if (!editingAllottee || !crewId) {
        setAllotteeLoading(false);
        return;
      }

      try {
        const apiModel = convertToApiModel(editingAllottee!);
        updateCrewAllottee(crewId.toString(), apiModel)
          .then((response) => {
            toast({
              title: "Allottee saved successfully",
              description: `Allottee ${editingAllottee?.name} has been updated.`,
              variant: "success",
            });
            setTriggerSave(false);
            fetchCrewAllottees(crewId.toString());
          })
          .catch((error) => {
            console.error("Error saving allottee:", error);
            toast({
              title: "Error saving allottee",
              description: "There was an error saving the allottee.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setAllotteeLoading(false);
            setTriggerSave(false);
            setIsEditingAllottee(false);
          });
      } catch (error) {
        console.error("Error saving allottee:", error);
        setAllotteeLoading(false);
        setTriggerSave(false);
      }
    }
  }, [
    triggerSave,
    crewId,
    editingAllottee,
    setAllotteeLoading,
    setTriggerSave,
    fetchCrewAllottees,
    setIsEditingAllottee,
  ]);

  //console.log('EDITING ALLOTTEE RESPONSE: ', editingAllottee);

  // for delete allottee
  useEffect(() => {
    if (triggerDelete) {
      setIsDeletingAllottee(true);

      if (!editingAllottee?.id || !crewId) {
        console.warn("Missing editingAllottee.id or crewId");
        setIsDeletingAllottee(false);
        setTriggerDelete(false);
        return;
      }

      deleteCrewAllottee(crewId.toString(), editingAllottee.id.toString())
        .then(() => {
          toast({
            title: "Allottee deleted successfully",
            description: `Allottee ${editingAllottee?.name} has been removed.`,
            variant: "success",
          });
          
          // show when allotment type is 2 and less than 100.
          if (editingAllottee.allotmentType === 2) {
            toast({
              title: "Update Required.",
              description:
                "The total allotment percentage is now less than 100%. Please update the remaining allottees.",
              variant: "warning",
            });
          }

          // Can still fetch if needed for internal state updates
          fetchCrewAllottees(crewId.toString());
        })
        .catch((error) => {
          console.error("Error deleting allottee:", error);
          toast({
            title: "Error deleting allottee",
            description: "There was an error deleting the allottee.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsDeletingAllottee(false);
          setTriggerDelete(false);
          setIsEditingAllottee(false);
        });
    }
  }, [triggerDelete, crewId, editingAllottee]);

  if (allotteesError) {
    return (
      <div className="text-center text-red-500">Error: {allotteesError}</div>
    );
  }

  const displayAllottee =
    isEditingAllottee || isAdding || triggerDelete
      ? editingAllottee
      : currentAllottee;

  // validating the name form
  useEffect(() => {
    const validateAllotteeForm = () => {
      const isValid = Boolean(displayAllottee?.name?.trim());
      setIsAllotteeValid(isValid);
    };

    validateAllotteeForm();
  }, [displayAllottee, setIsAllotteeValid]);

  const commonAllotmentType = React.useMemo(() => {
    if (!allottees || allottees.length === 0) return null;

    const hasPercentage = allottees.some((a) => a.allotmentType === 2);
    const hasAmount = allottees.some((a) => a.allotmentType === 1);

    if (hasPercentage && !hasAmount) return 2;
    if (hasAmount && !hasPercentage) return 1;

    return null; // mixed or undefined
  }, [allottees]);

  return (
    <div className="space-y-6">
      {isLoadingAllottees ? (
        <div className="text-center pt-6">Loading allottee data...</div>
      ) : (
        <>
          {/* Allottee selection */}
          {!isEditingAllottee && !isAdding ? (
            <>
              <div className="flex gap-4 w-1/2">
                <div className="flex-1">
                  <div className="relative rounded-lg border shadow-sm overflow-hidden">
                    <div className="flex h-11 w-full">
                      <div className="flex items-center px-4 bg-gray-50 border-r">
                        <span className="text-gray-700 font-medium whitespace-nowrap">
                          Select Allottee
                        </span>
                      </div>
                      <div className="flex-1 w-full flex items-center">
                        <Select
                          value={selectedIndex}
                          onValueChange={setSelectedIndex}
                          disabled={!displayAllottee} // disable when first name is not valid
                        >
                          <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                            <SelectValue placeholder="Select Allottee" />
                          </SelectTrigger>
                          <SelectContent>
                            {allottees.map((a, idx) => (
                              <SelectItem key={idx} value={idx.toString()}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative rounded-lg border shadow-sm overflow-hidden w-1/2">
              <div className="flex h-11 w-full">
                <div className="flex items-center px-4 bg-gray-50 border-r">
                  <span className="text-gray-700 font-medium whitespace-nowrap">
                      Allotment Type
                  </span>
                </div>
                <div className="flex-1 w-full flex items-center">
                    <Select
                      value={
                        commonAllotmentType !== null
                          ? commonAllotmentType.toString()
                          : displayAllottee?.allotmentType?.toString() || "1"
                      }
                      disabled={commonAllotmentType !== null}
                      onValueChange={(value) =>
                        handleInputChange("allotmentType", parseInt(value))
                      }
                    >
                    <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                      <SelectValue placeholder="Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Amount</SelectItem>
                      <SelectItem value="2">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Details display */}
          {displayAllottee ? (
            <div className="p-4 space-y-6">
              {/* Personal Info */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary">
                  Allottee Personal Information
                </h3>

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  {/* <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!displayAllottee.active}
                      onChange={(e) =>
                        isEditingAllottee || isAdding
                          ? handleInputChange("active", e.target.checked)
                          : null
                      }
                      disabled={!isEditingAllottee && !isAdding}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Active
                    </label>
                  </div> */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!displayAllottee.priority}
                      onChange={(e) =>
                        isEditingAllottee || isAdding
                          ? handleInputChange("priority", e.target.checked)
                          : null
                      }
                      disabled={!isEditingAllottee && !isAdding}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Priority for Amount Type
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!displayAllottee.receivePayslip}
                      onChange={(e) =>
                        isEditingAllottee || !isAdding
                          ? handleInputChange("receivePayslip", e.target.checked)
                          : null
                      }
                      disabled={!isEditingAllottee && !isAdding}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Dollar Allotment
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Name
                  </label>
                  <Input
                    value={displayAllottee.name}
                    readOnly={!isEditingAllottee && !isAdding}
                    className={`w-full h-10 ${
                      !isEditingAllottee && !isAdding
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                    onChange={(e) =>
                      (isEditingAllottee || isAdding) &&
                      handleInputChange("name", e.target.value)
                    }
                  />
                </div>

                {/* Relationship field - use Select in edit mode */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Relationship
                  </label>
                  {isEditingAllottee || isAdding ? (
                    <Select
                      value={displayAllottee.relationshipId}
                      onValueChange={handleRelationshipChange}
                    >
                      <SelectTrigger id="relationship" className="w-full !h-10">
                        <SelectValue placeholder="Select a relationship" />
                      </SelectTrigger>
                      <SelectContent className="h-70">
                        {allRelationshipData.map((relationship) => (
                          <SelectItem
                            key={relationship.RelationID}
                            value={relationship.RelationID.toString()}
                          >
                            {relationship.RelationName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={displayAllottee.relationship}
                      readOnly
                      className="w-full h-10 bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Contact Number
                  </label>
                  <Input
                    value={displayAllottee.contactNumber}
                    readOnly={!isEditingAllottee && !isAdding}
                    className={`w-full h-10 ${
                      !isEditingAllottee && !isAdding
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                    onChange={(e) =>
                      (isEditingAllottee || isAdding) &&
                      handleInputChange("contactNumber", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Address
                  </label>
                  <Input
                    value={displayAllottee.address}
                    readOnly={!isEditingAllottee && !isAdding}
                    className={`w-full h-10 ${
                      !isEditingAllottee && !isAdding
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                    onChange={(e) =>
                      (isEditingAllottee || isAdding) &&
                      handleInputChange("address", e.target.value)
                    }
                  />
                </div>

                {/* City Field */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    City
                  </label>
                  {isEditingAllottee || isAdding ? (
                    <>
                      <Select
                        value={displayAllottee.cityId}
                        onValueChange={handleCityChange}
                        disabled={!displayAllottee.provinceId}
                      >
                        <SelectTrigger className="w-full !h-10">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <div className="px-2 py-2 sticky top-0 bg-white z-10">
                            <Input
                              placeholder="Search cities..."
                              value={searchCity}
                              onChange={(e) => setSearchCity(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          {loading ? (
                            <SelectItem value="loading">Loading...</SelectItem>
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
                              {displayAllottee.provinceId
                                ? "No cities found"
                                : "Select a province first"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <Input
                      value={displayAllottee.city}
                      readOnly
                      className="w-full h-10 bg-gray-50"
                    />
                  )}
                </div>

                {/* Province Field */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Province
                  </label>
                  {isEditingAllottee || isAdding ? (
                    <>
                      <Select
                        value={displayAllottee.provinceId}
                        onValueChange={handleProvinceChange}
                      >
                        <SelectTrigger className="w-full !h-10">
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <div className="px-2 py-2 sticky top-0 bg-white z-10">
                            <Input
                              placeholder="Search provinces..."
                              value={searchProvince}
                              onChange={(e) =>
                                setSearchProvince(e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                          {loading ? (
                            <SelectItem value="loading">Loading...</SelectItem>
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
                    </>
                  ) : (
                    <Input
                      value={displayAllottee.province}
                      readOnly
                      className="w-full h-10 bg-gray-50"
                    />
                  )}
                </div>
              </div>

              {/* Bank Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank field */}
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      Bank
                    </label>
                    {isEditingAllottee || isAdding ? (
                      <Select
                        value={displayAllottee.bankId}
                        onValueChange={handleBankChange}
                      >
                        <SelectTrigger id="bank" className="w-full !h-10">
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBanks.map((bank) => (
                            <SelectItem
                              key={bank.BankID}
                              value={bank.BankID.toString()}
                            >
                              {bank.BankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={displayAllottee.bankName}
                        readOnly
                        className="w-full h-10 bg-gray-50"
                      />
                    )}
                  </div>

                  {/* Branch field */}
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      Branch
                    </label>
                    {isEditingAllottee || isAdding ? (
                      <Select
                        value={displayAllottee.branchId}
                        onValueChange={handleBranchChange}
                        disabled={!displayAllottee.bankId}
                      >
                        <SelectTrigger id="branch" className="w-full !h-10">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesForSelectedBank.length > 0 ? (
                            branchesForSelectedBank.map((branch) => (
                              <SelectItem
                                key={branch.BankBranchID}
                                value={branch.BankBranchID.toString()}
                              >
                                {branch.BankBranchName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              {displayAllottee.bankId
                                ? "No branches found for this bank"
                                : "Select a bank first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={displayAllottee.bankBranch}
                        readOnly
                        className="w-full h-10 bg-gray-50"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      Account Number
                    </label>
                    <Input
                      value={displayAllottee.accountNumber}
                      readOnly={!isEditingAllottee && !isAdding}
                      className={`w-full h-10 ${
                        !isEditingAllottee && !isAdding
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                      onChange={(e) =>
                        (isEditingAllottee || isAdding) &&
                        handleInputChange("accountNumber", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      {displayAllottee.allotmentType === 1
                        ? "Allotment Amount in" +
                          (displayAllottee.receivePayslip === 1
                            ? " (Dollar)"
                            : " (Peso)")
                        : "Allotment Percentage"}
                    </label>
                    <Input
                      type="number"
                      value={displayAllottee.allotment.toString()}
                      readOnly={!isEditingAllottee && !isAdding}
                      className={`w-full h-10 ${
                        !isEditingAllottee && !isAdding
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                      onChange={(e) =>
                        (isEditingAllottee || isAdding) &&
                        handleInputChange(
                          "allotment",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No allottee records found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
