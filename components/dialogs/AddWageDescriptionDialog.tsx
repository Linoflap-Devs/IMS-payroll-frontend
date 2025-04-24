import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddWageDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newWageDescription: any) => void;
}

export function AddWageDescriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddWageDescriptionDialogProps) {
  const [wageCode, setWageCode] = useState("");
  const [wageName, setWageName] = useState("");
  const [payableOnBoard, setPayableOnBoard] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!wageCode.trim() || !wageName.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Add API call to create wage description
      // const response = await addWageDescription({
      //   wageCode: wageCode.trim(),
      //   wageName: wageName.trim(),
      //   payableOnBoard,
      // });

      // For now, simulate success
      const mockResponse = {
        success: true,
        message: "Wage description added successfully",
        data: {
          WageCode: wageCode,
          WageName: wageName,
          PayableOnBoard: payableOnBoard ? 1 : 0,
        },
      };

      if (mockResponse.success) {
        toast({
          title: "Success",
          description: mockResponse.message,
        });

        if (onSuccess) {
          onSuccess(mockResponse.data);
        }

        // Reset form and close dialog
        setWageCode("");
        setWageName("");
        setPayableOnBoard(false);
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add wage description",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-[#2E37A4]">
            Add Wage Description
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Wage Code</label>
            <Input
              value={wageCode}
              onChange={(e) => setWageCode(e.target.value)}
              className="border border-[#E0E0E0] rounded-md"
              placeholder="Enter wage code"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Wage Name</label>
            <Input
              value={wageName}
              onChange={(e) => setWageName(e.target.value)}
              className="border border-[#E0E0E0] rounded-md"
              placeholder="Enter wage name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Payable On Board</label>
            <Select
              value={payableOnBoard ? "yes" : "no"}
              onValueChange={(value) => setPayableOnBoard(value === "yes")}
            >
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-sm h-11"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
