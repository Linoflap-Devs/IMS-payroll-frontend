"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, IdCard } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getCrewRemittanceList } from "@/src/services/remittance/crewRemittance.api";
import { useDebounce } from "@/lib/useDebounce";

type Crew = {
  id: number;
  crewCode: string;
  firstName: string;
  lastName: string;
  middleName: string;
  rankId: number;
  rank: string;
  vessel: string;
  crewName: string;
};

export default function Remittance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [crewData, setCrewData] = useState<Crew[]>([]);
  const [vessels, setVessels] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isLoadingRemittance, setLoadingRemittance] = useState(false);

  useEffect(() => {
    const fetchCrewRemittance = async () => {
      setLoadingRemittance(true);

      try {
        const res = await getCrewRemittanceList();

        if (res.success) {
          const mapped: (Crew & { crewName: string })[] = res.data.map(
            (item) => {
              const middleInitial = item.MiddleName
                ? ` ${item.MiddleName.charAt(0)}.`
                : "";

              return {
                id: item.CrewID,
                crewCode: item.CrewCode,
                firstName: item.FirstName,
                middleName: item.MiddleName,
                lastName: item.LastName,
                rankId: item.RankID,
                rank: item.Rank,
                vessel: item.Vessel,
                crewName: `${item.FirstName}${middleInitial} ${item.LastName}`,
              };
            }
          );

          const mappedVessels = res.data.map((item) => item.Vessel);
          const uniqueVessels = [...new Set(mappedVessels)];

          setVessels(uniqueVessels);
          setCrewData(mapped);
        } else {
          console.error("Failed to fetch crew remittance:", res.message);
        }
      } catch (err) {
        console.error("Error fetching crew remittance:", err);
      } finally {
        setLoadingRemittance(false);
      }
    };

    fetchCrewRemittance();
  }, []);

  const columns: ColumnDef<Crew>[] = [
    {
      accessorKey: "crewCode",
      header: "Crew Code",
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {row.getValue("crewCode")}
        </div>
      ),
    },
    {
      accessorKey: "crewName",
      header: "Crew Name",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("crewName")}
        </div>
      ),
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("rank")}
        </div>
      ),
    },
    {
      accessorKey: "vessel",
      header: "Vessel",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("vessel")}
        </div>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const crew = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link
                    href={`/home/remittance/details?name=${encodeURIComponent(
                      crew.crewName
                    )}&crewCode=${encodeURIComponent(
                      crew.crewCode
                    )}&rank=${encodeURIComponent(
                      crew.rank
                    )}&vessel=${encodeURIComponent(crew.vessel)}`}
                  >
                    <IdCard className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View Remittance
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const filteredCrew = crewData.filter((crew) => {
    const matchesSearch =
      crew.crewName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      crew.crewCode.toString().includes(debouncedSearch.toLowerCase()) ||
      crew.rank.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesVesselFilter =
      vesselFilter === "all" || crew.vessel === vesselFilter;

    return matchesSearch && matchesVesselFilter;
  });

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
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Remittance</h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
              <Input
                placeholder="Search crew by name, code, or rank..."
                className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                  <SelectValue placeholder="Filter by vessel" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Vessels</SelectItem>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            {isLoadingRemittance ? (
              <div className="text-center">Loading remittance data...</div>
            ) : (
              <div className="bg-[#F9F9F9] rounded-md border pb-3">
                <DataTable columns={columns} data={filteredCrew} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
