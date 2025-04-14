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

interface EditSalaryScaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salaryScale: {
    rank: string;
    wageType: string;
    amount: number;
  };
}

export function EditSalaryScaleDialog({
  open,
  onOpenChange,
  salaryScale,
}: EditSalaryScaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">
            Edit Salary Scale
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Rank</label>
            <Select defaultValue={salaryScale.rank}>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Captain">Captain</SelectItem>
                <SelectItem value="Chief Officer">Chief Officer</SelectItem>
                <SelectItem value="Second Officer">Second Officer</SelectItem>
                <SelectItem value="Third Officer">Third Officer</SelectItem>
                <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
                <SelectItem value="Engineering Officer">
                  Engineering Officer
                </SelectItem>
                <SelectItem value="Electrical Officer">
                  Electrical Officer
                </SelectItem>
                <SelectItem value="Deck Cadet">Deck Cadet</SelectItem>
                <SelectItem value="Engine Cadet">Engine Cadet</SelectItem>
                <SelectItem value="Boatswain">Boatswain</SelectItem>
                <SelectItem value="Able Seaman">Able Seaman</SelectItem>
                <SelectItem value="Ordinary Seaman">Ordinary Seaman</SelectItem>
                <SelectItem value="Chief Cook">Chief Cook</SelectItem>
                <SelectItem value="Steward">Steward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Wage Type</label>
            <Select defaultValue={salaryScale.wageType}>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select wage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic Wage">Basic Wage</SelectItem>
                <SelectItem value="Overtime">Overtime</SelectItem>
                <SelectItem value="Leave Pay">Leave Pay</SelectItem>
                <SelectItem value="Bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Amount</label>
            <Input
              type="number"
              defaultValue={salaryScale.amount}
              className="border border-[#E0E0E0] rounded-md"
            />
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
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
