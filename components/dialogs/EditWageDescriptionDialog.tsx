import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  updateWageDescription,
  WageDescriptionItem,
} from "@/src/services/wages/wageDescription.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface EditWageDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wageDescription: {
    wageId: number;
    wageCode: string;
    wageName: string;
    payableOnboard: boolean;
  };
  onUpdateSuccess?: (updatedWageDescription: WageDescriptionItem) => void;
}

export function EditWageDescriptionDialog({
  open,
  onOpenChange,
  wageDescription,
  onUpdateSuccess,
}: EditWageDescriptionDialogProps) {
  const [wageCode, setWageCode] = useState(wageDescription.wageCode);
  const [wageName, setWageName] = useState(wageDescription.wageName);
  const [payableOnboard, setPayableOnboard] = useState<number>(
    wageDescription.payableOnboard ? 1 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setWageCode(wageDescription.wageCode);
      setWageName(wageDescription.wageName);
      setPayableOnboard(wageDescription.payableOnboard ? 1 : 0);
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    if (!wageCode.trim() || !wageName.trim()) {
      toast({
        title: "Validation Error",
        description: "Wage Code and Wage Name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateWageDescription({
        wageID: wageDescription.wageId,
        wageCode: wageCode,
        wageName: wageName,
        wagePayableOnBoard: payableOnboard,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Wage description updated successfully.",
          variant: "success",
        });
        if (onUpdateSuccess && response.data) {
          onUpdateSuccess(response.data);
        }
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to update wage description.",
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
              Edit Wage Description
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Wage Code</label>
            <Input
              placeholder="Enter wage code"
              className="h-10"
              value={wageCode}
              onChange={(e) => setWageCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Wage Name</label>
            <Input
              placeholder="Enter wage name"
              className="h-10"
              value={wageName}
              onChange={(e) => setWageName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 w-full">
            <label className="text-sm text-gray-600">Payable On Board</label>
            <Select
              value={payableOnboard === 1 ? "1" : "0"}
              onValueChange={(value) => setPayableOnboard(parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Wage Description"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
