"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  getCrewAllottee,
  CrewAllottee as CrewAllotteeApi,
} from "@/src/services/crew/crew.api";
import { PlusCircle } from "lucide-react";

// UI model for allottee data
type Allottee = {
  id: number;
  name: string;
  relationship: string;
  contactNumber: string;
  address: string;
  city: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  allotment: number;
  active: boolean;
  priorityAmount: boolean;
  dollarAllotment: boolean;
};

export function CrewAllottee({ onAdd }: { onAdd?: () => void }) {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [allottees, setAllottees] = useState<Allottee[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("0");

  // Fetch allottee data on mount
  useEffect(() => {
    if (!crewId) return;
    getCrewAllottee(crewId)
      .then((res) => {
        if (res.success) {
          const mapped = res.data.map((a: CrewAllotteeApi) => ({
            id: a.AllotteeId,
            name: a.AllotteeName,
            relationship: a.RelationName,
            contactNumber: a.ContactNumber,
            address: `${a.Address}, ${a.CityName}, ${a.ProvinceName}`,
            city: a.CityName,
            bankName: a.BankName,
            bankBranch: a.BankBranch,
            accountNumber: a.AccountNumber,
            allotment: a.Allotment,
            active: true,
            priorityAmount: false,
            dollarAllotment: false,
          }));
          setAllottees(mapped);
          if (mapped.length > 0) setSelectedIndex("0");
        }
      })
      .catch((err) => console.error("Error fetching allottees:", err));
  }, [crewId]);

  // Only single list, no filtering
  const displayList = allottees;
  const current = displayList[parseInt(selectedIndex, 10)];

  return (
    <div className="space-y-6">
      {/* Allottee selection */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative rounded-lg border shadow-sm overflow-hidden">
            <div className="flex h-11 w-full">
              <div className="flex items-center px-4 bg-gray-50 border-r">
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  Select Allottee
                </span>
              </div>
              <div className="flex-1 w-full flex items-center">
                <Select value={selectedIndex} onValueChange={setSelectedIndex}>
                  <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                    <SelectValue placeholder="Select Allottee" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayList.map((a, idx) => (
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
        <div className="relative rounded-lg border shadow-sm overflow-hidden">
          <div className="flex h-11 w-full">
            <div className="flex items-center px-4 bg-gray-50 border-r">
              <span className="text-gray-700 font-medium whitespace-nowrap">
                Select Allotment Type
              </span>
            </div>
            <div className="flex-1 w-full flex items-center">
              <Select value="Amount">
                <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amount">Amount</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="h-11 px-5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Add Allottee</span>
          </Button>
        )}
      </div>

      {/* Details display */}
      {current ? (
        <div className="p-4 space-y-6 ">
          {/* Personal Info */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary">
              Allottee Personal Information
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={current.active}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={current.priorityAmount}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-gray-900">
                  Priority for Amount Type
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={current.dollarAllotment}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-gray-900">
                  Dollar Allottment
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Name</label>
              <Input
                readOnly
                value={current.name}
                className="w-full h-10 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Relationship
              </label>
              <Input
                readOnly
                value={current.relationship}
                className="w-full h-10 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Contact Number
              </label>
              <Input
                readOnly
                value={current.contactNumber}
                className="w-full h-10 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Address
              </label>
              <Input
                readOnly
                value={current.address}
                className="w-full h-10 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">City</label>
              <Input
                readOnly
                value={current.city}
                className="w-full h-10 bg-gray-50"
              />
            </div>
          </div>

          {/* Bank Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Bank</label>
                <Select value={current.bankName}>
                  <SelectTrigger className="w-full h-10 bg-gray-50">
                    <SelectValue placeholder={current.bankName} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={current.bankName}>
                      {current.bankName}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Branch
                </label>
                <Select value={current.bankBranch}>
                  <SelectTrigger className="w-full h-10 bg-gray-50">
                    <SelectValue placeholder={current.bankBranch} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={current.bankBranch}>
                      {current.bankBranch}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Account Number
                </label>
                <Input
                  readOnly
                  value={current.accountNumber}
                  className="w-full h-10 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Allottment
                </label>
                <Input
                  readOnly
                  value={current.allotment.toString()}
                  className="w-full h-10 bg-gray-50"
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
    </div>
  );
}
