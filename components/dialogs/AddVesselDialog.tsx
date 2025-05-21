import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { addVessel } from "@/src/services/vessel/vessel.api";
import { VesselItem } from "@/src/services/vessel/vessel.api";
import { useToast } from "@/components/ui/use-toast";
import {
  getVesselTypeList,
  VesselTypeItem,
} from "@/src/services/vessel/vesselType.api";
import {
  getVesselPrincipalList,
  VesselPrincipalItem,
} from "@/src/services/vessel/vesselPrincipal.api";

interface AddVesselDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newVessel: VesselItem) => void; // Add this prop
}

export function AddVesselDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddVesselDialogProps) {
  const [vesselCode, setVesselCode] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vesselTypes, setVesselTypes] = useState<VesselTypeItem[]>([]);
  const [principals, setPrincipals] = useState<VesselPrincipalItem[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, principalsResponse] = await Promise.all([
          getVesselTypeList(),
          getVesselPrincipalList(),
        ]);

        if (typesResponse.success && Array.isArray(typesResponse.data)) {
          setVesselTypes(typesResponse.data);
        }

        if (principalsResponse.success) {
          setPrincipals(principalsResponse.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch vessel types and principals",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setVesselCode("");
      setVesselName("");
      setVesselType("");
      setPrincipalName("");
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  //Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (
      !vesselCode.trim() ||
      !vesselName.trim() ||
      !vesselType ||
      !principalName
    ) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await addVessel({
        vesselCode: vesselCode.trim(),
        vesselName: vesselName.trim(),
        vesselType: Number(vesselType),
        vesselPrincipal: Number(principalName),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Vessel added successfully.",
          variant: "success",
        });
        // Call the onSuccess callback if provided
        if (onSuccess && response.data) {
          // Ensure we pass a single VesselItem
          const vesselData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          onSuccess(vesselData);
        }

        handleOpenChange(false); // Close the dialog after success
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vessel.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding vessel:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-[600px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <div className="p-6 pb-8">
          <div className="flex justify-between items-center mb-8">
            <DialogTitle className="text-2xl font-bold text-[#2F3593]">
              Add Vessel
            </DialogTitle>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <label htmlFor="vesselCode" className="block text-sm font-medium">
                Vessel Code
              </label>
              <Input
                id="vesselCode"
                name="vesselCode"
                value={vesselCode}
                onChange={(e) => setVesselCode(e.target.value)}
                className="w-full"
                placeholder="Enter vessel code"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label htmlFor="vesselName" className="block text-sm font-medium">
                Vessel Name
              </label>
              <Input
                id="vesselName"
                name="vesselName"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                className="w-full"
                placeholder="Enter vessel name"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label htmlFor="vesselType" className="block text-sm font-medium">
                Vessel Type
              </label>
              <Select
                name="vesselType"
                value={vesselType}
                onValueChange={setVesselType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  {vesselTypes.map((type) => (
                    <SelectItem
                      key={type.VesselTypeID}
                      value={type.VesselTypeID.toString()}>
                      {type.VesselTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <label
                htmlFor="principalName"
                className="block text-sm font-medium">
                Principal Name
              </label>
              <Select
                name="principalName"
                value={principalName}
                onValueChange={setPrincipalName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select principal name" />
                </SelectTrigger>
                <SelectContent>
                  {principals.map((principal) => (
                    <SelectItem
                      key={principal.PrincipalID}
                      value={principal.PrincipalID.toString()}>
                      {principal.PrincipalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-4 pt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-300 rounded-md text-black hover:bg-gray-100 hover:text-black">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] rounded-md"
              onClick={handleSubmit}
              disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" /> Add Vessel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
