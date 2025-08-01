"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { CrewBasic, CrewRankItem, getCrewRankList } from "@/src/services/crew/crew.api";
import { getVesselList } from "@/src/services/vessel/vessel.api";
import { CountriesItem, getCountriesList } from "@/src/services/location/location.api";
import { getPortList, IPort } from "@/src/services/port/port.api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ISelectedCrew, useJoinCrewStore } from "@/src/store/useJoinCrewStore";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { batchAddCrewToVessel } from "@/src/services/vessel/vesselCrew.api";

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
  const customStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

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
        <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md">
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
  const selectedCrew = useJoinCrewStore((state) => state.selectedCrew);
  const selectedVesselId = useJoinCrewStore((state) => state.selectedCrew[0].vesselId); // can you match this in the vesselOptions for this to be a default in the select vessel?

  //const crewMember = selectedCrew[0];
  const updateCrewRank = useJoinCrewStore((state) => state.updateCrewRank);

  const [crew, setCrew] = useState<CrewBasic | null>(null);
  const [vesselList, setVesselList] = useState<IVesselItem[]>([]);
  const [rankList, setRankList] = useState<CrewRankItem[]>([]);
  const [countryList, setCountryList] = useState<CountriesItem[]>([]);
  const [allPorts, setAllPorts] = useState<IPort[]>([]);
  const [filteredPorts, setFilteredPorts] = useState<IPort[]>([]);
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [signOnDate, setSignOnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [vesselOptions, setVesselOptions] = useState<
    { id: number; value: string; label: string }[]
  >([]);

  // useEffect(() => {
  //   getCrewBasic(crewMember.crewCode).then((response) => {
  //     if (response.success) {
  //       setCrew(response.data);
  //     }
  //   });
  // }, [crewMember.crewCode]);

  useEffect(() => {
    getVesselList().then((response) => {
      if (response.success) {
        const vesselList = response.data;
        setVesselList(vesselList);

        const options = response.data.map((v: any) => ({
          id: v.VesselID,
          value: v.VesselID.toString(),
          label: v.VesselName,
        }));
        setVesselOptions(options);

        // Set default selected vessel from store
        if (selectedVesselId) {
          const matchedOption = options.find((opt) => opt.value === selectedVesselId.toString());
          if (matchedOption) {
            setSelectedVessel(matchedOption.value); // string
          }
        }
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

  const rankOptions = rankList.map(rank => ({
    id: rank.RankID,
    value: rank.RankName.replace(/\s+/g, ""),
    label: rank.RankName.trim().replace(/\s+/g, " "),
  }));

  console.log(rankOptions);
  console.log(selectedCrew);

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
  const columns: ColumnDef<ISelectedCrew>[] = [
    {
      accessorKey: "crewCode",
      header: () => <div className="text-justify">Crew Code</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("crewCode")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: () => <div className="text-justify">Crew Name</div>,
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const profileImage = row.original.ProfileImage as string | undefined;

        return (
          <div className="flex items-center space-x-3 text-justify">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                <span>{name?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-left">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const badgeClass = {
          "On board": "bg-green-100 text-green-800 hover:bg-green-100/80",
          "Off board": "bg-red-100 text-red-800 hover:bg-red-100/80",
        }[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100/80";

        return (
          <div className="flex text-left">
            <Badge variant="secondary" className={badgeClass}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "rank",
      header: () => <div className="text-justify">Select Rank</div>,
      cell: ({ row }) => {
        const crewId = row.original.id;
        const selectedRank = row.original.rank;
        const cleanedRank = selectedRank?.replace(/\s+/g, "");

        console.log("Crew ID:", crewId);
        console.log("Original selected rank:", selectedRank);
        console.log("Cleaned rank:", cleanedRank);

        const handleRankChange = (newRank: string) => {
          console.log(`Crew ID ${crewId} selected new rank: ${newRank}`);
          updateCrewRank(crewId, newRank); // updates the global store
        };

        return (
          <div className="text-justify w-48 relative overflow-visible ">
            <SimpleSearchableSelect
              options={rankOptions}
              placeholder="Select rank"
              value={cleanedRank}
              onChange={handleRankChange}
            />
          </div>
        );
      },
    }
  ];
  
  const handleSubmit = (crewMembers: ISelectedCrew[]) => {
    setSubmitted(true);
    if (!selectedVessel || !signOnDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for missing ranks
    const hasMissingRanks = crewMembers.some(
      (member) => !rankList.find(rank => rank.RankName.replace(/\s+/g, "") === member.rank)
    );

    if (hasMissingRanks) {
      toast({
        title: "Missing Rank",
        description: "Please ensure each crew member has a valid rank selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload = crewMembers.map((crew) => {
      const matchingRank = rankList.find(
        (rank) => rank.RankName.replace(/\s+/g, "") === crew.rank
      );

      return {
        crewId: crew.id,
        rankId: matchingRank?.RankID ?? 0,
      };
    });

    const vesselId = Number(selectedVessel);
    const portId = selectedPort ? Number(selectedPort) : undefined;
    const date = new Date(signOnDate);

    console.log("Batch joining crew to vessel...");
    console.log("Payload:", payload);
    console.log("Vessel ID:", vesselId);
    console.log("Port ID:", portId);
    console.log("Sign-On Date:", date);

    batchAddCrewToVessel(vesselId, portId, date, payload)
      .then((response) => {
        if (response.success) {
          toast({
            title: "Success",
            description: "All crew successfully joined to vessel.",
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
    <div className="h-full w-full p-4 pt-2">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Joining Crews...</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 mb-8">
            {/* Left half (form) */}
            <div className="pr-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Vessel</label>
                  <SimpleSearchableSelect
                    options={vesselOptions}
                    placeholder="Select vessel"
                    value={selectedVessel}
                    onChange={setSelectedVessel}
                  //disabled={!!selectedVessel}
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
            </div>

            <div className="flex items-end justify-end">
              <Button
                className="bg-[#2F3593] hover:bg-[#252a72] w-full"
                onClick={() => handleSubmit(selectedCrew)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Plus />
                    Join Crews
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                Loading...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={selectedCrew}
                pageSize={7}
              //pagination={false} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

