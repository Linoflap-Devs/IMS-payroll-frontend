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
import { Ship, MapPin, User } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Icon } from "@iconify/react/dist/iconify.js";
import { IOffBoardCrew } from "./SearchCrewDialog";

interface JoinCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMember: IOffBoardCrew;
}

export function JoinCrewDialog({
  open,
  onOpenChange,
  crewMember,
}: JoinCrewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-semibold text-[#2F3593] text-center">
            Join Crew
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
              {crewMember.FirstName} {crewMember.LastName}
            </h3>

            <div className="flex items-center gap-1 justify-center">
              <span
                className={`${
                  crewMember.CrewStatusID === 2
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                } px-2 py-0.5 rounded-full text-xs`}>
                {crewMember.CrewStatusID === 2 ? "Off board" : "On board"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-black-500" />
                <div>
                  <div className="text-gray-500">Crew Code</div>
                  <div>{crewMember.CrewCode || "not assigned"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:badge-outline"
                  width="16"
                  height="16"
                  className="text-gray-500"
                />
                <div>
                  <div className="text-gray-500">Rank</div>
                  <div>{crewMember.Rank || "not assigned"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Current Vessel</div>
                  {/* <div>{crewMember.currentVessel || "not assigned"}</div> */}
                  <div>not assigned</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Country</div>
                  {/* <div>{crewMember.country || "not assigned"}</div> */}
                  <div>not assigned</div>
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
              <label className="text-sm font-medium">Country</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="japan">Japan</SelectItem>
                  <SelectItem value="philippines">Philippines</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokyo">Tokyo Port</SelectItem>
                  <SelectItem value="yokohama">Yokohama Port</SelectItem>
                  <SelectItem value="osaka">Osaka Port</SelectItem>
                  <SelectItem value="kobe">Kobe Port</SelectItem>
                  <SelectItem value="nagoya">Nagoya Port</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sign on date</label>
              <Input type="date" className="w-full" />
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
          <Button className="flex-1 bg-[#2F3593] hover:bg-[#252a72]">
            Join Crew
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
