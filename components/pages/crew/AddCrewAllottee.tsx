import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Dummy data for select fields
const DUMMY_RELATIONSHIPS = [
  { id: "1", name: "Spouse" },
  { id: "2", name: "Child" },
  { id: "3", name: "Parent" },
  { id: "4", name: "Sibling" },
];

const DUMMY_PROVINCES = [
  { id: "1", name: "Metro Manila" },
  { id: "2", name: "Cebu" },
  { id: "3", name: "Davao" },
  { id: "4", name: "Pampanga" },
];

const DUMMY_CITIES = {
  "1": [
    { id: "1", name: "Makati" },
    { id: "2", name: "Quezon City" },
    { id: "3", name: "Manila" },
  ],
  "2": [
    { id: "4", name: "Cebu City" },
    { id: "5", name: "Mandaue" },
  ],
  "3": [
    { id: "6", name: "Davao City" },
    { id: "7", name: "Tagum" },
  ],
  "4": [
    { id: "8", name: "Angeles" },
    { id: "9", name: "San Fernando" },
  ],
};

const DUMMY_BANKS = [
  { id: "1", name: "BDO" },
  { id: "2", name: "BPI" },
  { id: "3", name: "Metrobank" },
];

const DUMMY_BRANCHES = {
  "1": [
    { id: "1", name: "BDO Makati" },
    { id: "2", name: "BDO Ortigas" },
  ],
  "2": [
    { id: "3", name: "BPI Ayala" },
    { id: "4", name: "BPI Paseo" },
  ],
  "3": [
    { id: "5", name: "Metrobank BGC" },
    { id: "6", name: "Metrobank Pasay" },
  ],
};

export default function AllotteeForm() {
  // Initial empty allottee data
  const initialAllottee = {
    allotmentType: 1, // 1 for Amount, 2 for Percentage
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
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setAllottee((prev) => ({ ...prev, [field]: value }));
  };

  // Handle province selection and update cities
  const handleProvinceChange = (value) => {
    setAllottee((prev) => ({
      ...prev,
      provinceId: value,
      cityId: "", // Reset city when province changes
    }));

    // Update available cities based on selected province
    setAvailableCities(DUMMY_CITIES[value] || []);
  };

  // Handle bank selection and update branches
  const handleBankChange = (value) => {
    setAllottee((prev) => ({
      ...prev,
      bankId: value,
      branchId: "", // Reset branch when bank changes
    }));

    // Update available branches based on selected bank
    setAvailableBranches(DUMMY_BRANCHES[value] || []);
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
                  {DUMMY_RELATIONSHIPS.map((relationship) => (
                    <SelectItem key={relationship.id} value={relationship.id}>
                      {relationship.name}
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
                  {DUMMY_PROVINCES.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
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
                  {availableCities.length > 0 ? (
                    availableCities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
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
                  {DUMMY_BANKS.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
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
                  {availableBranches.length > 0 ? (
                    availableBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
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
        </div>
      </div>
    </div>
  );
}
