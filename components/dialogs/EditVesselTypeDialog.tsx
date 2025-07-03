import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateVesselType } from "@/src/services/vessel/vesselType.api"; // Import the new API function
import { VesselTypeItem } from "@/src/services/vessel/vesselType.api";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface EditVesselTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselTypeData: {
    vesselTypeId: number;
    vesselTypeCode: string;
    vesselTypeName: string;
  };
  onSuccess?: (updatedVesselType: VesselTypeItem) => void; // Add this prop
}

export function EditVesselTypeDialog({
  open,
  onOpenChange,
  vesselTypeData,
  onSuccess,
}: EditVesselTypeDialogProps) {
  const [vesselTypeCode, setVesselTypeCode] = useState(
    vesselTypeData.vesselTypeCode
  );
  const [vesselTypeName, setVesselTypeName] = useState(
    vesselTypeData.vesselTypeName
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (vesselTypeData) {
      setVesselTypeCode(vesselTypeData.vesselTypeCode);
      setVesselTypeName(vesselTypeData.vesselTypeName);
    }
  }, [vesselTypeData]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setVesselTypeCode(vesselTypeData.vesselTypeCode);
      setVesselTypeName(vesselTypeData.vesselTypeName);
      setIsSubmitting(false);
    }
    onOpenChange(open);
    console.log(vesselTypeData);
  };

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
      const response = await updateVesselType({
        vesselTypeID: vesselTypeData.vesselTypeId, // Match the API's expected casing
        vesselTypeCode: vesselTypeCode.trim(),
        vesselTypeName: vesselTypeName.trim(),
        isActive: 1, // Assuming you want to set it as active
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Vessel Type updated successfully.",
          variant: "success",
        });
        if (onSuccess && response.data) {
          onSuccess(response.data as VesselTypeItem);
        }
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to update vessel type.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-[600px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-center">
            <DialogTitle className="text-2xl font-semibold text-primary w-full text-center">
              Edit Vessel Type
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Vessel Type Code</label>
            <Input
              placeholder="Enter vessel code"
              className={`h-10 ${
                vesselTypeCode.length == 0 || vesselTypeCode.length > 10
                  ? "border-red-500 focus:!ring-red-500/50"
                  : ""
              }`}
              value={vesselTypeCode}
              onChange={(e) => setVesselTypeCode(e.target.value)}
              disabled={isSubmitting}
            />
            {vesselTypeCode.length == 0 || vesselTypeCode.length > 10 ? (
              <>
                <p className="text-red-500 text-xs">
                  Vessel Code is required and should be 10 or less characters.
                </p>
              </>
            ) : (
              <p className="text-gray-500/70 text-xs">
                Vessel Code should be less than 10 characters.
              </p>
            )}
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                vesselTypeCode.length > 10 ||
                vesselTypeName.length == 0
              }>
              <Pencil className="mr-2 h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update Vessel Type"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
