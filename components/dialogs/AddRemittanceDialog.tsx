"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  addCrewRemittance,
  type AddCrewRemittanceData,
  type AllotteeOption,
} from "@/src/services/remittance/crewRemittance.api";
import { toast } from "../ui/use-toast";

const REMITTANCE_STATUS_OPTIONS = [
  { value: "0", label: "Pending" },
  { value: "1", label: "Completed" },
  { value: "2", label: "Declined" },
  { value: "3", label: "On Hold" },
] as const;

interface AddRemittanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewCode: string;
  allottees: AllotteeOption[];
  onSuccess?: () => void;
}

export function AddRemittanceDialog({
  open,
  onOpenChange,
  crewCode,
  allottees,
  onSuccess,
}: AddRemittanceDialogProps) {
  const [formData, setFormData] = useState({
    allotteeID: "",
    amount: "",
    remarks: "",
    status: "0",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setFormData({
        allotteeID: "",
        amount: "",
        remarks: "",
        status: "0",
      });
      setErrorMessage("");
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const allotteeID = parseInt(formData.allotteeID);
      const amount = parseFloat(formData.amount);
      const status = formData.status;
      const remarks = formData.remarks.trim();

      if (!formData.allotteeID || isNaN(allotteeID) || allotteeID <= 0) {
        setErrorMessage("Please select an allottee");
        return;
      }

      if (!formData.amount || isNaN(amount) || amount <= 0) {
        setErrorMessage("Please enter a valid amount");
        return;
      }

      if (!remarks) {
        setErrorMessage("Please enter remarks");
        return;
      }

      if (!status) {
        setErrorMessage("Please select a valid status");
        return;
      }

      const cleanData: AddCrewRemittanceData = {
        allotteeID: allotteeID,
        amount: amount,
        remarks: remarks,
        status: status,
      };

      const response = await addCrewRemittance(crewCode, cleanData);

      if (response && response.success) {
        onSuccess?.();
        onOpenChange(false);

        setFormData({
          allotteeID: "",
          amount: "",
          remarks: "",
          status: "0",
        });
        setErrorMessage("");

        toast({
          title: "Remittance Added",
          description: "The remittance has been successfully added.",
          variant: "success",
        });
      } else {
        setErrorMessage(response?.message || "Failed to add remittance");
      }
    } catch (error: any) {
      let errorMsg = "An error occurred while adding remittance";

      if (error.response?.data?.message) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          const errors = message
            .map((err: any) => {
              if (typeof err === "object" && err !== null) {
                const key = Object.keys(err)[0];
                const value = err[key];
                return `${key}: ${value}`;
              }
              return String(err);
            })
            .join(", ");
          errorMsg = `Validation errors: ${errors}`;
        } else if (typeof message === "string") {
          errorMsg = message;
        } else {
          errorMsg = JSON.stringify(message);
        }
      } else if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidAllottees =
    allottees && Array.isArray(allottees) && allottees.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Add Remittance
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            Add a new remittance entry for the selected allottee
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          {errorMessage && (
            <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">
              Allottee <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.allotteeID}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  allotteeID: value,
                }));
                setErrorMessage("");
              }}>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md h-11">
                <SelectValue placeholder="Select allottee" />
              </SelectTrigger>
              <SelectContent>
                {hasValidAllottees ? (
                  allottees.map((allottee) => (
                    <SelectItem
                      key={allottee.AllotteeDetailID}
                      value={allottee.AllotteeDetailID.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {allottee.AllotteeName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {allottee.RelationName} • {allottee.BankName}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    No allottees available for this crew member
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {!hasValidAllottees && (
              <p className="text-xs text-gray-500">
                No allottees found for crew code: {crewCode}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
              className="border border-[#E0E0E0] rounded-md h-11"
              value={formData.amount}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }));
                setErrorMessage("");
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">
              Remarks <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter remarks"
              className="border border-[#E0E0E0] rounded-md h-11"
              value={formData.remarks}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  remarks: e.target.value,
                }));
                setErrorMessage("");
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  status: value,
                }));
                setErrorMessage("");
              }}>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {REMITTANCE_STATUS_OPTIONS.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-sm h-11"
              onClick={() => {
                onOpenChange(false);
                setErrorMessage("");
              }}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90"
              onClick={handleSubmit}
              disabled={isLoading || !hasValidAllottees}>
              {isLoading ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Remittance
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
