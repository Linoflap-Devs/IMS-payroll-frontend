"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ship, MapPin, User, Check, ChevronDown, Loader2, Info } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Icon } from "@iconify/react/dist/iconify.js";
import { IOffBoardCrew } from "./SearchCrewDialog";
import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { CrewBasic, getCrewBasic } from "@/src/services/crew/crew.api";
import Base64Image from "../Base64Image";
import Image from "next/image";
import { getVesselList } from "@/src/services/vessel/vessel.api";
import {
  CountriesItem,
  getCountriesList,
} from "@/src/services/location/location.api";
import { getPortList, IPort } from "@/src/services/port/port.api";
import { cn } from "@/lib/utils";
import { addCrewToVessel } from "@/src/services/vessel/vesselCrew.api";
import { toast } from "../ui/use-toast";
import { AxiosError } from "axios";

interface JoinCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMember: IOffBoardCrew;
  SelectedVesselID: number;
  SelectedVesselName: string;
  setOnSuccess: Dispatch<SetStateAction<boolean>>;
}

export interface IVesselItem {
  VesselID: number;
  VesselCode: string;
  VesselName: string;
  VesselType: string;
  Principal: string;
  IsActive: number;
}

function SimpleSearchableSelect({
  options,
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
}: {
  options: { id: string | number; value: string; label: string }[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    } else {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled} // prevent click
        className={cn(
          `w-full justify-between`,
          disabled
            ? "bg-gray-100 text-gray-800 cursor-not-allowed"
            : "bg-white",
          !value && "text-muted-foreground",
          className
        )}
        onClick={() => {
          if (!disabled) setOpen(!open); // don’t open dropdown if disabled
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md">
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center px-2 py-2 cursor-pointer hover:bg-accent",
                    value === option.value && "bg-accent"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{option.label}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function JoinCrewDialog({
  open,
  onOpenChange,
  crewMember,
  SelectedVesselID,
  SelectedVesselName,
  setOnSuccess,
}: JoinCrewDialogProps) {
  const [crew, setCrew] = useState<CrewBasic | null>(null);
  const [vesselList, setVesselList] = useState<IVesselItem[]>([]);
  const [countryList, setCountryList] = useState<CountriesItem[]>([]);
  const [allPorts, setAllPorts] = useState<IPort[]>([]);
  const [filteredPorts, setFilteredPorts] = useState<IPort[]>([]);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [signOnDate, setSignOnDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getCrewBasic(crewMember.CrewCode)
        .then((response) => {
          if (response.success) {
            console.log("Crew details fetched successfully:", response.data);
            setCrew(response.data);
          } else {
            console.error("Failed to fetch crew details:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching crew details:", error);
        });
    }
  }, [open, crewMember.CrewCode]);

  useEffect(() => {
    if (open) {
      getVesselList()
        .then((response) => {
          if (response.success) {
            const vesselList = response.data;
            console.log("Vessel list fetched successfully:", vesselList);
            setVesselList(vesselList);

            // matching of selected vessel
            const matched = vesselList.find(
              (v) => v.VesselID === SelectedVesselID
            );

            if (matched) {
              setSelectedVessel(matched.VesselID.toString());
            }
          } else {
            console.error("Failed to fetch vessel list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching vessel list:", error);
        });
    } else {
      setVesselList([]);
      setSelectedVessel("");
      setSelectedCountry("");
      setSelectedPort("");
      setFilteredPorts([]);
      setAllPorts([]);
      setCountryList([]);
      setSignOnDate("");
      setSubmitted(false);
    }
  }, [open, SelectedVesselID]);

  useEffect(() => {
    if (open) {
      getCountriesList()
        .then((response) => {
          if (response.success) {
            setCountryList(response.data);
          } else {
            console.error("Failed to fetch country list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching country list:", error);
        });
    }
  }, [open]);

  useEffect(() => {
    if (countryList) {
      getPortList()
        .then((response) => {
          if (response.success) {
            setAllPorts(response.data);
            setFilteredPorts(response.data);
          } else {
            console.error("Failed to fetch port list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching port list:", error);
        });
    }
  }, [countryList]);

  useEffect(() => {
    if (selectedCountry) {
      const filtered = allPorts.filter(
        (port) => port.CountryID.toString() === selectedCountry
      );
      setFilteredPorts(filtered);
      const currentPort = allPorts.find(
        (p) => p.PortID.toString() === selectedPort
      );
      if (currentPort && currentPort.CountryID.toString() !== selectedCountry) {
        setSelectedPort("");
      }
    } else {
      setFilteredPorts(allPorts);
    }
  }, [selectedCountry, allPorts, selectedPort]);

  const vesselOptions = vesselList.map((vessel) => ({
    id: vessel.VesselID,
    value: vessel.VesselID.toString(),
    label: vessel.VesselName,
  }));

  const countriesWithPorts = [
    ...new Set(allPorts.map((port) => port.CountryID)),
  ];

  const countryOptions = countryList
    .filter((country) => countriesWithPorts.includes(country.CountryID))
    .map((country) => ({
      id: country.CountryID,
      value: country.CountryID.toString(),
      label: country.CountryName,
    }));

  const portOptions = filteredPorts.map((port) => ({
    id: port.PortID,
    value: port.PortID.toString(),
    label: port.PortName,
  }));

  const handleSubmit = () => {
    setSubmitted(true);
    if (!selectedVessel || !selectedPort || !signOnDate) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields. (Vessel, Port, Sign on date)",
        variant: "destructive",
      });

      return;
    }

    setIsLoading(true);

    const joinCrewData = {
      crewCode: crewMember.CrewCode,
      vesselId: Number(selectedVessel),
      portId: Number(selectedPort),
      dateOnBoard: signOnDate,
      rankId: crewMember.RankID,
    };

    addCrewToVessel(
      joinCrewData.crewCode,
      joinCrewData.vesselId,
      joinCrewData.portId,
      joinCrewData.rankId,
      new Date(joinCrewData.dateOnBoard)
    )
      .then((response) => {
        if (response.success) {
          toast({
            title: "Success",
            description: "Crew has been successfully added to the vessel.",
            variant: "success",
          });
          onOpenChange(false);
          setSubmitted(false);
          setOnSuccess(true);
        } else {
          toast({
            title: "Error",
            description: `Failed to join crew: ${response.message}`,
            variant: "destructive",
          });
        }
      })
      .catch((error: unknown) => {
        const err = error as AxiosError<{ message?: string }>;
        console.log("Error joining crew:", err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            "An error occurred while joining the crew.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
              {crew?.ProfileImage ? (
                <Base64Image
                  imageType={crew.ProfileImage.ContentType}
                  alt="Crew Profile Image"
                  base64String={crew.ProfileImage.FileContent}
                  width={160}
                  height={160}
                  className="object-contain w-full h-full"
                />
              ) : (
                <Image
                  width={256}
                  height={160}
                  src="/image.png"
                  alt="Selfie with ID Attachment"
                  className="object-cover w-full h-full"
                />
              )}
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
                } px-2 py-0.5 rounded-full text-xs`}
              >
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
                  <div>N/A</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Country</div>
                  <div>not assigned</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right side - Form Fields */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel</label>
              <SimpleSearchableSelect
                options={vesselOptions}
                placeholder="Select vessel"
                value={selectedVessel}
                onChange={setSelectedVessel}
                //disabled
                disabled={!!selectedVessel} // disable if vessel already selected
                className={`w-full ${
                  submitted && !selectedVessel ? "border-red-500" : ""
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <SimpleSearchableSelect
                options={countryOptions}
                placeholder="Select country"
                value={selectedCountry}
                onChange={setSelectedCountry}
              />
              {!selectedCountry && (
                <p className="text-xs text-gray-500 italic">
                  Please select a country first to enable port selection.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <SimpleSearchableSelect
                options={portOptions}
                placeholder="Select port"
                value={selectedPort}
                onChange={setSelectedPort}
                disabled={!selectedCountry} // Disable when country is not selected
                className={`w-full ${
                  submitted && !selectedPort && selectedCountry ? "border-red-500" : ""
                }`}
              />
              {submitted && !selectedPort && selectedCountry && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <Info className="w-4 h-4" />
                  Please select a port.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sign on date</label>
              <Input
                type="date"
                className={`w-full ${
                  submitted && !signOnDate ? "border-red-500" : ""
                }`}
                value={signOnDate}
                onChange={(e) => setSignOnDate(e.target.value)}
              />
              {submitted && !signOnDate && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <Info className="w-4 h-4" />
                  Please select a sign off date.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#2F3593] hover:bg-[#252a72]"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Joining...
              </>
            ) : (
              "Join Crew"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
