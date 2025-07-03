import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateVesselPrincipal } from "@/src/services/vessel/vesselPrincipal.api"; // Import the new API function
import { VesselPrincipalItem } from "@/src/services/vessel/vesselPrincipal.api";
import { useState } from "react";

interface EditVesselPrincipalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselPrincipalData: {
    vesselPrincipalId: number;
    vesselPrincipalCode: string;
    vesselPrincipalName: string;
  };
  onSuccess?: (updatedVesselPrincipal: VesselPrincipalItem) => void; // Add this prop
}

export function EditVesselPrincipalDialog({
  open,
  onOpenChange,
  vesselPrincipalData,
  onSuccess,
}: EditVesselPrincipalDialogProps) {
  const [vesselPrincipalCode, setVesselPrincipalCode] = useState(
    vesselPrincipalData.vesselPrincipalCode
  );
  const [vesselPrincipalName, setVesselPrincipalName] = useState(
    vesselPrincipalData.vesselPrincipalName
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setVesselPrincipalCode(vesselPrincipalData.vesselPrincipalCode);
      setVesselPrincipalName(vesselPrincipalData.vesselPrincipalName);
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    // BAsic VAlidation
    if (!vesselPrincipalCode.trim() || !vesselPrincipalName.trim()) {
      toast({
        title: "Validation Error",
        description:
          "Vessel Principal Code and Vessel Principal Name are required.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await updateVesselPrincipal({
        principalID: vesselPrincipalData.vesselPrincipalId,
        principalCode: vesselPrincipalCode,
        principalName: vesselPrincipalName,
        isActive: 1,
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Vessel Principal updated successfully.",
          variant: "success",
        });
        if (onSuccess && response.data) {
          onSuccess(response.data as unknown as VesselPrincipalItem);
        }
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to update vessel principal.",
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-primary w-full text-center">
              Edit Vessel Principal
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Principal Code</label>
            <Input
              placeholder="Enter principal code"
              className="h-10"
              value={vesselPrincipalCode}
              onChange={(e) => setVesselPrincipalCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Principal Name</label>
            <Input
              placeholder="Enter principal name"
              className="h-10"
              value={vesselPrincipalName}
              onChange={(e) => setVesselPrincipalName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Principal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
