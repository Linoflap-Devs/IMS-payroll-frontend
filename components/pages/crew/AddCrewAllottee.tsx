import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRelationshipStore } from "@/src/store/useRelationshipStore";
import { useBankStore } from "@/src/store/useBankStore";
import { useLocationStore } from "@/src/store/useLocationStore";
import { Button } from "@/components/ui/button";

export default function AllotteeForm() {
  const initialAllottee = {
    allotmentType: 1,
    name: "",
    relationshipId: "",
    address: "",
    contactNumber: "",
    cityId: "",
    provinceId: "",
    bankId: "",
    branchId: "",
    accountNumber: "",
    allotment: 0,
    isDollar: 0,
  };

  const [allottee, setAllottee] = useState(initialAllottee);

  const { allRelationshipData, fetchRelationships } = useRelationshipStore();
  const {
    fetchBanks,
    setSelectedBankId,
    getUniqueBanks,
    getBranchesForSelectedBank,
  } = useBankStore();
  const { cities, provinces, fetchCities, fetchProvinces } = useLocationStore();

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    fetchProvinces();
    fetchCities();
  }, [fetchProvinces, fetchCities]);

  const uniqueBanks = getUniqueBanks();
  const branchesForSelectedBank = getBranchesForSelectedBank();

  const filteredCities = useMemo(() => {
    const provinceId = parseInt(allottee.provinceId);
    const citiesInProvince = cities.filter(
      (city) => city.ProvinceID === provinceId
    );

    // if (!searchCity.trim()) {
    //   return citiesInProvince.slice(0, 50);
    // }

    return (
      citiesInProvince
        //   .filter((city) =>
        //     city.CityName.toLowerCase().includes(searchCity.toLowerCase())
        //   )
        .slice(0, 100)
    );
  }, [cities, allottee.provinceId]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setAllottee((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setAllottee((prev) => ({
      ...prev,
      provinceId: value,
      cityId: "", // Reset city when province changes
    }));
  };

  // Handle bank selection and update branches
  const handleBankChange = (value: string) => {
    setAllottee((prev) => ({
      ...prev,
      bankId: value,
      branchId: "",
    }));

    setSelectedBankId(Number(value));
  };

  const handleSubmit = () => {
    console.log("Allottee Data:", allottee);
  };

  return (
    <div className="space-y-6">
      {/* Allotment Type Selection */}
      <div className="relative rounded-lg border shadow-sm overflow-hidden w-1/2">
        <div className="flex h-11 w-full">
          <div className="flex items-center px-4 bg-gray-50 border-r">
            <span className="text-gray-700 font-medium whitespace-nowrap">
              Select Allotment Type
            </span>
          </div>
          <div className="flex-1 w-full flex items-center">
            <Select
              value={allottee.allotmentType.toString()}
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

      {/* Allottee Details */}
      <div className="p-4 space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">
            Allottee Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Name</label>
              <Input
                value={allottee.name}
                className="w-full h-10 bg-white"
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Relationship
              </label>
              <Select
                value={allottee.relationshipId}
                onValueChange={(value) =>
                  handleInputChange("relationshipId", value)
                }>
                <SelectTrigger id="relationship" className="w-full !h-10">
                  <SelectValue placeholder="Select a relationship" />
                </SelectTrigger>
                <SelectContent>
                  {/* {DUMMY_RELATIONSHIPS.map((relationship) => (
                    <SelectItem key={relationship.id} value={relationship.id}>
                      {relationship.name}
                    </SelectItem>
                  ))} */}
                  {allRelationshipData.map((relationship) => (
                    <SelectItem
                      key={relationship.RelationID}
                      value={relationship.RelationID.toString()}>
                      {relationship.RelationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Contact Number
              </label>
              <Input
                value={allottee.contactNumber}
                className="w-full h-10 bg-white"
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Address
              </label>
              <Input
                value={allottee.address}
                className="w-full h-10 bg-white"
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            {/* Province Field */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Province
              </label>
              <Select
                value={allottee.provinceId}
                onValueChange={handleProvinceChange}>
                <SelectTrigger className="w-full !h-10">
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem
                      key={province.ProvinceID}
                      value={province.ProvinceID.toString()}>
                      {province.ProvinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Field */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">City</label>
              <Select
                value={allottee.cityId}
                onValueChange={(value) => handleInputChange("cityId", value)}
                disabled={!allottee.provinceId}>
                <SelectTrigger className="w-full !h-10">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <SelectItem
                        key={city.CityID}
                        value={city.CityID.toString()}>
                        {city.CityName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {allottee.provinceId
                        ? "No cities found for this province"
                        : "Select a province first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
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
              <label className="text-sm text-gray-500 mb-1 block">Bank</label>
              <Select value={allottee.bankId} onValueChange={handleBankChange}>
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
            </div>

            {/* Branch field */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Branch</label>
              <Select
                value={allottee.branchId}
                onValueChange={(value) => handleInputChange("branchId", value)}
                disabled={!allottee.bankId}>
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
                      {allottee.bankId
                        ? "No branches found for this bank"
                        : "Select a bank first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Account Number
              </label>
              <Input
                value={allottee.accountNumber}
                className="w-full h-10 bg-white"
                onChange={(e) =>
                  handleInputChange("accountNumber", e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                {allottee.allotmentType === 1
                  ? "Allotment Amount in" +
                    (allottee.isDollar === 1 ? " (Dollar)" : " (Peso)")
                  : "Allotment Percentage"}
              </label>
              <Input
                type="number"
                value={allottee.allotment.toString()}
                className="w-full h-10 bg-white"
                onChange={(e) =>
                  handleInputChange(
                    "allotment",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
