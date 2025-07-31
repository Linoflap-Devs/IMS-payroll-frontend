"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { CrewBasic, CrewRankItem, getCrewBasic, getCrewRankList } from "@/src/services/crew/crew.api";
import { getVesselList } from "@/src/services/vessel/vessel.api";
import { CountriesItem, getCountriesList } from "@/src/services/location/location.api";
import { getPortList, IPort } from "@/src/services/port/port.api";
import { cn } from "@/lib/utils";
import { addCrewToVessel } from "@/src/services/vessel/vesselCrew.api";
import { toast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { Check, ChevronDown, Loader2, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ISelectedCrew, useJoinCrewStore } from "@/src/store/useJoinCrewStore";

// interface PageProps {
//   crewMember: IOffBoardCrew;
//   crewMembers: IOffBoardCrew[];
//   SelectedVesselID: number;
//   SelectedVesselName: string;
// }

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

export default function JoinCrewPage() {
  //const { crewMember, crewMembers, SelectedVesselID } = props;
  const selectedCrew = useJoinCrewStore((state) => state.selectedCrew);
  const crewMember = selectedCrew[0];

  const [crew, setCrew] = useState<CrewBasic | null>(null);
  const [vesselList, setVesselList] = useState<IVesselItem[]>([]);
  const [rankList, setRankList] = useState<CrewRankItem[]>([]);
  const [countryList, setCountryList] = useState<CountriesItem[]>([]);
  const [allPorts, setAllPorts] = useState<IPort[]>([]);
  const [filteredPorts, setFilteredPorts] = useState<IPort[]>([]);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [signOnDate, setSignOnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCrewBasic(crewMember.crewCode).then((response) => {
      if (response.success) {
        setCrew(response.data);
      }
    });
  }, [crewMember.crewCode]);

  useEffect(() => {
    getVesselList().then((response) => {
      if (response.success) {
        const vesselList = response.data;
        setVesselList(vesselList);
        const matched = vesselList.find((v: any) => v.VesselID === selectedVessel);
        if (matched) setSelectedVessel(matched.VesselID.toString());
      }
    });
    getCrewRankList().then((response) => {
      if (response.success) setRankList(response.data);
    });
    getCountriesList().then((response) => {
      if (response.success) setCountryList(response.data);
    });
  }, [selectedVessel]);

  useEffect(() => {
    getPortList().then((response) => {
      if (response.success) {
        setAllPorts(response.data);
        setFilteredPorts(response.data);
      }
    });
  }, [countryList]);

  useEffect(() => {
    if (selectedCountry) {
      const filtered = allPorts.filter(port => port.CountryID.toString() === selectedCountry);
      setFilteredPorts(filtered);
      const currentPort = allPorts.find(p => p.PortID.toString() === selectedPort);
      if (currentPort && currentPort.CountryID.toString() !== selectedCountry) {
        setSelectedPort("");
      }
    } else {
      setFilteredPorts(allPorts);
    }
  }, [selectedCountry, allPorts, selectedPort]);

  const vesselOptions = vesselList.map((v: any) => ({
    id: v.VesselID,
    value: v.VesselID.toString(),
    label: v.VesselName,
  }));

  const rankOptions = rankList.map(rank => ({
    id: rank.RankID,
    value: rank.RankID.toString(),
    label: rank.RankName,
  }));

  const countriesWithPorts = [...new Set(allPorts.map(port => port.CountryID))];

  const countryOptions = countryList
    .filter(country => countriesWithPorts.includes(country.CountryID))
    .map(country => ({
      id: country.CountryID,
      value: country.CountryID.toString(),
      label: country.CountryName,
    }));

  const portOptions = filteredPorts.map(port => ({
    id: port.PortID,
    value: port.PortID.toString(),
    label: port.PortName,
  }));

  const handleSubmit = (crewMember: ISelectedCrew) => {
    setSubmitted(true);
    if (!selectedVessel || !signOnDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const joinCrewData = {
      crewCode: crewMember.crewCode,
      vesselId: Number(selectedVessel),
      portId: Number(selectedPort) || undefined,
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
            description: "Crew successfully joined to vessel.",
            variant: "success",
          });
          router.back();
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Unexpected error occurred.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="h-full w-full p-6 pt-5 bg-[#F6F8FC]">
      <h1 className="text-3xl font-semibold my-4">Join Crew</h1>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">Vessel</label>
              <SimpleSearchableSelect
                options={vesselOptions}
                placeholder="Select vessel"
                value={selectedVessel}
                onChange={setSelectedVessel}
                disabled={!!selectedVessel}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Rank</label>
              <SimpleSearchableSelect
                options={rankOptions}
                placeholder="Select rank"
                value={selectedRank}
                onChange={setSelectedRank}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Country</label>
              <SimpleSearchableSelect
                options={countryOptions}
                placeholder="Select country"
                value={selectedCountry}
                onChange={setSelectedCountry}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Port</label>
              <SimpleSearchableSelect
                options={portOptions}
                placeholder="Select port"
                value={selectedPort}
                onChange={setSelectedPort}
                disabled={!selectedCountry}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Sign on date</label>
              <Input
                type="date"
                value={signOnDate}
                onChange={(e) => setSignOnDate(e.target.value)}
              />
            </div>

          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Selected Crews to Join
            </h2>
            <div className="space-y-4">
              {selectedCrew.map((crewMember, index) => (
                <div
                  key={crewMember.id}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-sm px-6 py-5"
                >
                  <div className="flex-shrink-0">
                    <span className="bg-[#2f5293] inline-flex items-center justify-center rounded-full h-14 w-14">
                      <Users className="text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-base">
                      {crewMember.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {crewMember.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 whitespace-nowrap">
                    {crewMember.crewCode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-4 text-left">
            <Button
              className="w-1/2 text-right bg-[#2F3593] hover:bg-[#252a72]"
              onClick={() => handleSubmit(crewMember)} // or pass index if needed
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                "Join Crew"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
