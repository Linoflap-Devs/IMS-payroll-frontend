"use client";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Shield, CalendarDays, Ship, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Icon } from "@iconify/react/dist/iconify.js";
import { RiShieldStarLine } from "react-icons/ri";

interface PromoteCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMember: {
    id: number;
    name: string;
    status: string;
    rank: string;
    crewCode: string;
    currentVessel?: string;
    vesselId?: number;
  };
}

export function PromoteCrewDialog({
  open,
  onOpenChange,
  crewMember,
}: PromoteCrewDialogProps) {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-semibold text-[#2F3593] text-center">
            Promote Crew
          </DialogTitle>
        </DialogHeader>

        <div className="flex p-6 pt-2 gap-6">
          {/* Left side - Crew Info Card */}
          <Card className="w-[300px] bg-[#FCFCFC] rounded-lg px-4 py-4 gap-2.5">
            <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg border border-gray-200">
              <img
                src="/image.png"
                alt="Profile"
                className="w-full h-full object-contain"
              />
            </div>

            <h3 className="text-xl font-semibold text-center mb-0">
              {crewMember.name}
            </h3>

            <div className="flex items-center gap-1 justify-center">
              <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                On board
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <RiShieldStarLine className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Rank</div>
                  <div>{crewMember.rank}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Sign-on date</div>
                  <div>{crewMember.signOnDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Current Vessel</div>
                  <div>{crewMember.currentVessel}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Country</div>
                  <div>Japan</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right side - Form Fields */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atlas-island">Atlas Island</SelectItem>
                  <SelectItem value="amakus-island">Amakus Island</SelectItem>
                  <SelectItem value="andes-island">Andes Island</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Rank</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captain">Captain</SelectItem>
                  <SelectItem value="chief-officer">Chief Officer</SelectItem>
                  <SelectItem value="second-officer">Second Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sign off date</label>

              <Input type="date" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            Promote Crew
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
