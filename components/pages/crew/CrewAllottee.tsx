"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCrewStore } from "@/src/store/useCrewStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { useBankStore } from "@/src/store/useBankStore";
import { useRelationshipStore } from "@/src/store/useRelationshipStore";
import { AllotteeUiModel, AllotteeApiModel } from "@/types/crewAllottee";

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
  active: true,
  priorityAmount: false,
  dollarAllotment: false,
  isDollar: 0,
  allotmentType: 1,
  allotteeDetailID: "",
};

interface ICrewAllotteeProps {
  onAdd?: () => void;
  isEditingAllottee?: boolean;
  isAdding?: boolean;
  onSave?: (allottee: AllotteeApiModel) => void; // Changed to API model
  onCancel?: () => void;
}

export function CrewAllottee({
  // onAdd,
  isEditingAllottee = false,
  isAdding = false,
  // onSave,
  onCancel,
}: ICrewAllotteeProps) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<AllotteeUiModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("0");
  const [currentAllottee, setCurrentAllottee] =
    useState<AllotteeUiModel | null>(null);
  const [editingAllottee, setEditingAllottee] =
    useState<AllotteeUiModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchProvince, setSearchProvince] = useState("");

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

  const { cities, provinces, fetchCities, fetchProvinces } = useLocationStore();

  // Fetch allottee data on mount
  useEffect(() => {
    if (!crewId) return;
    fetchCrewAllottees(crewId);
    return () => {
      resetAllottees(); // Clean up on unmount
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
    // Update both the bank ID and bank name in the editing state
    if (!editingAllottee) return;

    const selectedBank = uniqueBanks.find((b) => b.BankID.toString() === value);

    setEditingAllottee({
      ...editingAllottee,
      bankId: value,
      bankName: selectedBank?.BankName || "",
      // Clear branch when bank changes
      branchId: "",
      bankBranch: "",
    });

    // Also update the bank store state
    setSelectedBankId(Number(value));
  };

  const handleBranchChange = (value: string) => {
    // Update both the branch ID and branch name in the editing state
    if (!editingAllottee) return;

    const selectedBranch = branchesForSelectedBank.find(
      (b) => b.BankBranchID.toString() === value
    );

    setEditingAllottee({
      ...editingAllottee,
      branchId: value,
      bankBranch: selectedBranch?.BankBranchName || "",
    });

    // Also update the branch store state
    setSelectedBranchId(Number(value));
  };

  // Map API data to UI model whenever allottees change
  useEffect(() => {
    const mapped = storeAllottees.map((a) => ({
      id: a.AllotteeDetailID,
      name: a.AllotteeName,
      relationship: a.RelationName,
      contactNumber: a.ContactNumber,
      address: a.Address,
      province: a.ProvinceName,
      city: a.CityName,
      bankName: a.BankName,
      bankBranch: a.BankBranch,
      accountNumber: a.AccountNumber,
      allotment: a.Allotment,
      active: a.IsActive === 1,
      priorityAmount: a.PriorityAmount === 1,
      dollarAllotment: a.IsDollar === 1,
      isDollar: a.IsDollar,
      allotmentType: a.AllotmentType,
      allotteeDetailID: a.AllotteeDetailID,
    }));

    setAllottees(mapped);
    if (mapped.length > 0) setSelectedIndex("0");
  }, [storeAllottees]);

  // Set current allottee based on selection or adding mode
  useEffect(() => {
    if (isAdding) {
      setCurrentAllottee(emptyAllottee);
      setEditingAllottee(emptyAllottee);
    } else if (allottees.length > 0) {
      const index = parseInt(selectedIndex, 10);
      setCurrentAllottee({ ...allottees[index] });

      // Initialize editing state when entering edit mode
      if (isEditingAllottee) {
        setEditingAllottee({ ...allottees[index] });

        // Initialize bank and branch store state based on the selected allottee
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

  // Filter cities based on selected province
  const filteredCities = useMemo(() => {
    // If editing allottee is null or no province is selected, return empty array
    if (!editingAllottee || !editingAllottee.provinceId) {
      return [];
    }

    const provinceId = parseInt(editingAllottee.provinceId);
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceId
    );

    if (!searchCity.trim()) {
      return citiesInProvince.slice(0, 50); // Only show first 50 cities initially
    }

    return citiesInProvince
      .filter((city) =>
        city.CityName.toLowerCase().includes(searchCity.toLowerCase())
      )
      .slice(0, 100); // Limit to 100 results maximum for performance
  }, [cities, searchCity, editingAllottee]);

  // Filter provinces for search
  const filteredProvinces = useMemo(() => {
    if (!searchProvince.trim()) {
      return provinces; // Usually provinces are fewer, so we can show all
    }
    return provinces.filter((province) =>
      province.ProvinceName.toLowerCase().includes(searchProvince.toLowerCase())
    );
  }, [provinces, searchProvince]);

  // Handle input changes for editing state
  const handleInputChange = (field: keyof AllotteeUiModel, value: unknown) => {
    if (!editingAllottee) return;

    setEditingAllottee({
      ...editingAllottee,
      [field]: value,
    });
  };

  // Handle city selection (update both city name and ID)
  const handleCityChange = (cityId: string) => {
    if (!editingAllottee) return;

    const selectedCity = cities.find((c) => c.CityID.toString() === cityId);

    setEditingAllottee({
      ...editingAllottee,
      cityId: cityId,
      city: selectedCity?.CityName || "",
    });
  };

  // Handle province selection (update both province name and ID)
  const handleProvinceChange = (provinceId: string) => {
    if (!editingAllottee) return;

    const selectedProvince = provinces.find(
      (p) => p.ProvinceID.toString() === provinceId
    );

    setEditingAllottee({
      ...editingAllottee,
      provinceId: provinceId,
      province: selectedProvince?.ProvinceName || "",
      // Clear city when province changes
      cityId: "",
      city: "",
    });
  };

  // Handle relationship selection
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

  // Convert UI model to API model for saving
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
      priority: uiModel.priorityAmount,
      isActive: uiModel.active ? 1 : 0,
      receivePayslip: 0, // Default value or add to UI model if needed
      isDollar: uiModel.isDollar,
      allotteeDetailID: uiModel.allotteeDetailID,
    };
  };

  // Handle save action
  const handleSave = () => {
    if (!editingAllottee) return;

    // Update the current allottee with edited values
    setCurrentAllottee({ ...editingAllottee });

    // Update the allottees array
    const updatedAllottees = [...allottees];
    updatedAllottees[parseInt(selectedIndex, 10)] = { ...editingAllottee };
    setAllottees(updatedAllottees);

    // Convert to API model and call parent save handler
    const apiModel = convertToApiModel(editingAllottee);
    console.log("Saving allottee API model:", apiModel);
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset editing state to current display state
    if (currentAllottee) {
      setEditingAllottee({ ...currentAllottee });
    }

    // Call parent cancel handler if provided
    if (onCancel) {
      onCancel();
    }
  };

  if (allotteesError) {
    return (
      <div className="text-center text-red-500">Error: {allotteesError}</div>
    );
  }

  // Determine which allottee object to use for display/edit
  const displayAllottee =
    isEditingAllottee || isAdding ? editingAllottee : currentAllottee;

  return (
    <div className="space-y-6">
      {isLoadingAllottees ? (
        <div className="text-center">Loading allottee data...</div>
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
                          onValueChange={setSelectedIndex}>
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
                    Select Allotment Type
                  </span>
                </div>
                <div className="flex-1 w-full flex items-center">
                  <Select
                    value={displayAllottee?.allotmentType.toString() || "1"}
                    onValueChange={(value) =>
                      handleInputChange("allotmentType", parseInt(value))
                    }>
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

                {/* Action buttons for edit mode */}
                {(isEditingAllottee || isAdding) && (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleSave}
                      className="h-9 px-4 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      <span className="font-medium">Save</span>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="h-9 px-4 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300">
                      <X className="h-4 w-4 mr-2" />
                      <span className="font-medium">Cancel</span>
                    </Button>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={displayAllottee.active}
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={displayAllottee.priorityAmount}
                      onChange={(e) =>
                        isEditingAllottee || isAdding
                          ? handleInputChange(
                              "priorityAmount",
                              e.target.checked
                            )
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
                      checked={displayAllottee.isDollar === 1}
                      onChange={(e) =>
                        isEditingAllottee || isAdding
                          ? handleInputChange(
                              "isDollar",
                              e.target.checked ? 1 : 0
                            )
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
                      onValueChange={handleRelationshipChange}>
                      <SelectTrigger id="relationship" className="w-full !h-10">
                        <SelectValue placeholder="Select a relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {allRelationshipData.map((relationship) => (
                          <SelectItem
                            key={relationship.RelationID}
                            value={relationship.RelationID.toString()}>
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
                        disabled={!displayAllottee.provinceId}>
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
                          {isLoading ? (
                            <SelectItem value="loading">Loading...</SelectItem>
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
                        onValueChange={handleProvinceChange}>
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
                          {isLoading ? (
                            <SelectItem value="loading">Loading...</SelectItem>
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
                        onValueChange={handleBankChange}>
                        <SelectTrigger id="bank" className="w-full !h-10">
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBanks.map((bank) => (
                            <SelectItem
                              key={bank.BankID}
                              value={bank.BankID.toString()}>
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
                        disabled={!displayAllottee.bankId}>
                        <SelectTrigger id="branch" className="w-full !h-10">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesForSelectedBank.length > 0 ? (
                            branchesForSelectedBank.map((branch) => (
                              <SelectItem
                                key={branch.BankBranchID}
                                value={branch.BankBranchID.toString()}>
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
                          (displayAllottee.isDollar === 1
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
