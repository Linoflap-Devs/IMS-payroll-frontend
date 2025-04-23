import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addVesselType } from "@/src/services/vessel/vesselType.api"; // Import the new API function
import { VesselTypeItem } from "@/src/services/vessel/vesselType.api";

interface AddVesselTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newVesselType: VesselTypeItem) => void; // Add this prop
}

export function AddVesselTypeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddVesselTypeDialogProps) {
  // Form state
  const [vesselTypeCode, setVesselTypeCode] = useState("");
  const [vesselTypeName, setVesselTypeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setVesselTypeCode("");
      setVesselTypeName("");
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!vesselTypeCode.trim() || !vesselTypeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Vessel Code and Vessel Type Name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addVesselType({
        vesselTypeCode: vesselTypeCode.trim(),
        vesselTypeName: vesselTypeName.trim(),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Vessel type added successfully.",
        });

        // Call success callback with the new vessel type if provided
        if (onSuccess && response.data) {
          // Ensure we pass a single VesselTypeItem
          const vesselTypeData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          onSuccess(vesselTypeData);
        }

        // Close the dialog
        handleOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vessel type.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding vessel type:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
              Add Vessel Type
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Vessel Code</label>
            <Input
              placeholder="Enter vessel code"
              className="h-10"
              value={vesselTypeCode}
              onChange={(e) => setVesselTypeCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Vessel Type Name</label>
            <Input
              placeholder="Enter vessel type"
              className="h-10"
              value={vesselTypeName}
              onChange={(e) => setVesselTypeName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Vessel Type"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
