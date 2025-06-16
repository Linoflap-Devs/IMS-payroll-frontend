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
import { DeductionDescriptionItem } from "@/src/services/deduction/deductionDescription.api";

interface EditDeductionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deduction: DeductionDescriptionItem;
}

export function EditDeductionTypeDialog({
  open,
  onOpenChange,
  deduction,
}: EditDeductionTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Edit Deduction Type
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Deduction Code</label>
            <Input
              defaultValue={deduction.DeductionCode}
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Deduction Name</label>
            <Input
              defaultValue={deduction.DeductionName}
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Deduction Type</label>
            <Select>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select deduction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Common Deduction</SelectItem>
                <SelectItem value="2">Loan Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Currency</label>
            <Select>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">PHP</SelectItem>
                <SelectItem value="2">USD</SelectItem>
                {/* <SelectItem value="eur">EUR</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-sm h-11"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
