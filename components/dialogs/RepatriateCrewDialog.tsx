"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronDown, Loader2, Info } from "lucide-react";
import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { Input } from "../ui/input";
import { getPortList, IPort } from "@/src/services/port/port.api";
import {
  CountriesItem,
  getCountriesList,
} from "@/src/services/location/location.api";
import { cn } from "@/lib/utils";
import { repatriateCrew } from "@/src/services/vessel/vesselCrew.api";
import { toast } from "../ui/use-toast";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface RepatriateCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMembers: {
    id: number;
    name: string;
    status: string;
    rank: string;
    crewCode: string;
    currentVessel?: string;
    country?: string;
    vesselId: number;
  }[];
  crewMember: {
    id: number;
    name: string;
    status: string;
    rank: string;
    crewCode: string;
    currentVessel?: string;
    country?: string;
    vesselId: number;
  }[];
  setOnSuccess: Dispatch<SetStateAction<boolean>>;
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

export function RepatriateCrewDialog({
  open,
  onOpenChange,
  setOnSuccess,
  crewMember,
  crewMembers,
}: RepatriateCrewDialogProps) {
  //const [crew, setCrew] = useState<CrewBasic | null>(null); // displaying crew details
  const [countryList, setCountryList] = useState<CountriesItem[]>([]);
  const [allPorts, setAllPorts] = useState<IPort[]>([]); // Store all ports
  const [filteredPorts, setFilteredPorts] = useState<IPort[]>([]); // Store filtered ports
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [signOffDate, setSignOffDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getCountriesList()
        .then((response) => {
          if (response.success) {
            setCountryList(response.data);
          } else {
            console.error("Failed to fetch countries list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching countries list:", error);
        });
    }
  }, [open]);

  useEffect(() => {
    if (countryList.length > 0) {
      getPortList()
        .then((response) => {
          if (response.success) {
            setAllPorts(response.data); // Store all ports
            setFilteredPorts(response.data); // Initially show all ports
          } else {
            console.error("Failed to fetch ports list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching ports list:", error);
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

  const columns: ColumnDef<typeof crewMembers[number]>[] = [
    {
      accessorKey: "crewCode",
      header: "Crew Code",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">{row.getValue("crewCode")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Crew Name",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-left">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">{row.getValue("rank")}</div>
      ),
    },
  ];

  console.log('CREW MEMBERS: ', crewMembers);

  const handleSubmit = () => {
    setSubmitted(true);

    if (!selectedPort || !signOffDate) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields. (Port, Sign off date)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const repatriateData = {
      crewId: crewMember.id,
      crewCode: crewMember.crewCode,
      countryId: Number(selectedCountry),
      portId: Number(selectedPort),
      signOffDate: signOffDate,
    };

    repatriateCrew(
      repatriateData.crewCode,
      crewMember.vesselId,
      Number(selectedPort),
      new Date(signOffDate)
    )
      .then((response) => {
        if (response.success) {
          toast({
            title: "Crew Repatriated",
            description: `Crew ${crewMember.name} has been successfully repatriated.`,
            variant: "success",
          });
          onOpenChange(false);
          setSubmitted(false);
        } else {
          toast({
            title: "Failed to Repatriate Crew",
            description: response.message,
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error repatriating crew:", error);
        toast({
          title: "Error Repatriating Crew",
          description: "An error occurred while repatriating the crew.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
        setOnSuccess(true);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-2 max-w-[870px] gap-0 border rounded-lg overflow-hidden bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-semibold text-[#2F3593] text-center">
            Repatriate Crews
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex p-6 py-4 gap-6">
          {/* Left Column */}
          <div className="flex-[1] space-y-6 mb-10">
            {/* Country Selection */}
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

            {/* Port Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <SimpleSearchableSelect
                options={portOptions}
                placeholder="Select port"
                value={selectedPort}
                disabled={!selectedCountry}
                onChange={setSelectedPort}
                className={`${submitted && !selectedPort && selectedCountry ? "border-red-500" : ""
                  }`}
              />
              {submitted && !selectedPort && selectedCountry && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <Info className="w-4 h-4" />
                  Please select a port.
                </p>
              )}
            </div>

            {/* Sign Off Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sign off date</label>
              <Input
                type="date"
                className={`w-full ${submitted && !signOffDate ? "border-red-500" : ""
                  }`}
                value={signOffDate}
                onChange={(e) => setSignOffDate(e.target.value)}
              />
              {submitted && !signOffDate && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <Info className="w-4 h-4" />
                  Please select a sign off date.
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[2.4] space-y-3">
            <div className="rounded-md border max-h-[410px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">Loading...</div>
              ) : (
                <DataTable
                  columns={columns}
                  data={crewMembers}
                  pagination={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Repatriating...
              </>
            ) : (
              "Repatriate Crew(s)"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
