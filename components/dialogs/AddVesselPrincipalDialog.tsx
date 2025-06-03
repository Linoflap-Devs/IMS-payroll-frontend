import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { addVesselPrincipal } from "@/src/services/vessel/vesselPrincipal.api";
import { VesselPrincipalItem } from "@/src/services/vessel/vesselPrincipal.api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AddVesselPrincipalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newVesselPrincipal: VesselPrincipalItem) => void; // Add this prop
}

export function AddVesselPrincipalDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddVesselPrincipalDialogProps) {
  // Form state
  const [principalCode, setPrincipalCode] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPrincipalCode("");
      setPrincipalName("");
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };
  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!principalCode.trim() || !principalName.trim()) {
      toast({
        title: "Validation Error",
        description: "Principal Code and Principal Name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addVesselPrincipal({
        principalCode: principalCode.trim(),
        principalName: principalName.trim(),
      });

      if (response.success) {
        toast({
          title: "Success",
          description:
            response.message || "Vessel principal added successfully.",
          variant: "success",
        });
        // Call the onSuccess callback if provided
        if (onSuccess && response.data) {
          // Ensure we pass a single VesselPrincipalItem
          const principalData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          onSuccess(principalData);
        }

        handleOpenChange(false); // Close the dialog after success
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vessel principal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding vessel principal:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the vessel principal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-4 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-primary w-full text-center">
              Add Vessel Principal
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Principal Code</label>
            <Input
              placeholder="Enter principal code"
              className="h-10"
              value={principalCode}
              onChange={(e) => setPrincipalCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Principal Name</label>
            <Input
              placeholder="Enter principal name"
              className="h-10"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Principal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
