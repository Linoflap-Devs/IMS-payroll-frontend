import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditVesselTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselTypeData: {
    vesselTypeCode: string;
    vesselType: string;
  };
}

export function EditVesselTypeDialog({
  open,
  onOpenChange,
  vesselTypeData,
}: EditVesselTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-4 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-primary w-full text-center">
              Edit Vessel Type
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Vessel Code</label>
            <Input
              placeholder="Enter vessel code"
              className="h-10"
              defaultValue={vesselTypeData.vesselTypeCode}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Vessel Type Name</label>
            <Input
              placeholder="Enter vessel type"
              className="h-10"
              defaultValue={vesselTypeData.vesselType}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1 h-10">Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
