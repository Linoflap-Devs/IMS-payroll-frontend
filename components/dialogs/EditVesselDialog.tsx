import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
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

interface EditVesselDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselData: {
    vesselCode: string;
    vesselName: string;
    vesselType: string;
    principalName: string;
    status: string;
  };
}

export function EditVesselDialog({
  open,
  onOpenChange,
  vesselData,
}: EditVesselDialogProps) {
  const [formData, setFormData] = useState({
    vesselCode: "",
    vesselName: "",
    vesselType: "",
    principalName: "",
    status: "Active",
  });

  useEffect(() => {
    if (open && vesselData) {
      setFormData(vesselData);
    }
  }, [open, vesselData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated vessel data:", formData);

    // Here you would typically send the data to an API
    // For now, we'll just close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[600px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <div className="p-6 pb-8">
          <div className="flex justify-between items-center mb-8">
            <DialogTitle className="text-2xl font-bold text-[#2F3593]">
              Edit Vessel
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="vesselCode"
                  className="block text-sm font-medium"
                >
                  Vessel Code
                </label>
                <Input
                  id="vesselCode"
                  name="vesselCode"
                  value={formData.vesselCode}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter vessel code"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium">
                  Status
                </label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label
                  htmlFor="vesselName"
                  className="block text-sm font-medium"
                >
                  Vessel Name
                </label>
                <Input
                  id="vesselName"
                  name="vesselName"
                  value={formData.vesselName}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter vessel name"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label
                  htmlFor="vesselType"
                  className="block text-sm font-medium"
                >
                  Vessel Type
                </label>
                <Select
                  name="vesselType"
                  value={formData.vesselType}
                  onValueChange={(value) =>
                    handleSelectChange("vesselType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tanker">Tanker</SelectItem>
                    <SelectItem value="Cargo">Cargo</SelectItem>
                    <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                    <SelectItem value="Container Ship">
                      Container Ship
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <label
                  htmlFor="principalName"
                  className="block text-sm font-medium"
                >
                  Principal Name
                </label>
                <Select
                  name="principalName"
                  value={formData.principalName}
                  onValueChange={(value) =>
                    handleSelectChange("principalName", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select principal name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                    <SelectItem value="Robert Johnson">
                      Robert Johnson
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex gap-4 pt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-300 rounded-md text-black hover:bg-gray-100 hover:text-black"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1 bg-[#2F3593] text-white hover:bg-[#252a72] rounded-md"
              >
                <Pencil className="mr-2 h-4 w-4" /> Update Vessel
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
