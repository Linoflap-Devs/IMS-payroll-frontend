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
import {
  editWageForex,
  IEditWagePayload,
} from "@/src/services/wages/wageForex.api";
import { useState } from "react";

interface EditForexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forex: {
    year: number;
    month: number;
    exchangeRate: number;
  };
}

export function EditForexDialog({
  open,
  onOpenChange,
  forex,
}: EditForexDialogProps) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [year, setYear] = useState(forex.year);
  const [month, setMonth] = useState(forex.month);
  const [exchangeRate, setExchangeRate] = useState(forex.exchangeRate);

  const handleSave = () => {
    const payload: IEditWagePayload = {
      // exchangeRateIdD: forex.id,
      exchangeRateMonth: month,
      exchangeRateYear: year,
      ExchangeRate: exchangeRate,
    };
    // editWageForex(forex.id, payload)
    //   .then((res) => {
    //     if (res.success) {
    //       // Handle successful edit
    //     } else {
    //       // Handle error
    //     }
    //   })
    //   .catch((err) => {
    //     // Handle error
    //   });

    console.log("Saving forex data:", payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-[#2E37A4]">
            Edit Forex
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Year</label>
            <Input
              type="number"
              defaultValue={forex.year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Month</label>
            <Select defaultValue={forex.month.toString()}>
              <SelectTrigger className="w-full border border-[#E0E0E0] rounded-md">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem
                    key={index}
                    value={(index + 1).toString()}
                    onChange={() => setMonth(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Exchange Rate</label>
            <Input
              type="number"
              step="0.1"
              defaultValue={forex.exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
              className="border border-[#E0E0E0] rounded-md"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-sm h-11"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 text-sm h-11 bg-[#2E37A4] hover:bg-[#2E37A4]/90"
              onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
