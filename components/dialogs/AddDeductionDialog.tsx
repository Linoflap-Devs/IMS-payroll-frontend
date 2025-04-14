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
import { Plus } from "lucide-react";

interface AddDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDeductionDialog({
  open,
  onOpenChange,
}: AddDeductionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Add Deduction
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Deduction</label>
            <Select>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select deduction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash-advance">Cash Advance</SelectItem>
                <SelectItem value="lbc-courier">LBC Courier</SelectItem>
                <SelectItem value="allotment">Allotment</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Remarks</label>
            <Input
              placeholder="Enter remarks"
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Status</label>
            <Select>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="adjusted">Adjusted</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-sm h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Amount
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
