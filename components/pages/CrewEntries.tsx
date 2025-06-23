"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Search, MoreHorizontal, Filter, Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PiUserListFill } from "react-icons/pi";
import { getCrewDeductionList } from "@/src/services/deduction/crewDeduction.api";
import { CrewRankItem, getCrewRankList } from "@/src/services/crew/crew.api";
import { getVesselList, VesselItem } from "@/src/services/vessel/vessel.api";

type CrewDeduction = {
  CrewCode: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Rank: string;
  VesselName: string;
  crewName: string;
};

export default function Deduction() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("all");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [ranks, setRanks] = useState<CrewRankItem[]>([]);
  const [vessels, setVessels] = useState<VesselItem[]>([]);
  const [crewDeductionData, setCrewDeductionData] = useState<CrewDeduction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState({
    crew: true,
    ranks: true,
    vessels: true,
  });

  // Load crew deduction data
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, crew: true }));
    getCrewDeductionList()
      .then((res) => {
        if (res.success) {
          const mapped: CrewDeduction[] = res.data.map((item) => ({
            ...item,
            crewName: `${item.FirstName} ${item.MiddleName} ${item.LastName}`,
          }));
          setCrewDeductionData(mapped);
        } else {
          console.error("Failed to fetch crew deduction:", res.message);
        }
      })
      .catch((err) => console.error("Error fetching crew deduction:", err))
      .finally(() => setIsLoading((prev) => ({ ...prev, crew: false })));
  }, []);

  // Load ranks with loading state
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, ranks: true }));
    getCrewRankList()
      .then((response) => {
        if (response.success) {
          // Pre-filter valid ranks to avoid doing it during render
          const validRanks = response.data.filter(
            (rank) => rank.RankName && rank.RankName.trim() !== ""
          );
          setRanks(validRanks);
        } else {
          console.error("Failed to fetch crew ranks:", response.message);
        }
      })
      .catch((error) => console.error("Error fetching crew ranks:", error))
      .finally(() => setIsLoading((prev) => ({ ...prev, ranks: false })));
  }, []);

  // Load vessels with loading state
  useEffect(() => {
    setIsLoading((prev) => ({ ...prev, vessels: true }));
    getVesselList()
      .then((response) => {
        if (response.success) {
          // Pre-filter valid vessels to avoid doing it during render
          const validVessels = response.data.filter(
            (vessel) => vessel.VesselName && vessel.VesselName.trim() !== ""
          );
          setVessels(validVessels);
        } else {
          console.error("Failed to fetch vessels:", response.message);
        }
      })
      .catch((error) => console.error("Error fetching vessels:", error))
      .finally(() => setIsLoading((prev) => ({ ...prev, vessels: false })));
  }, []);

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredCrewDeduction = useMemo(() => {
    return crewDeductionData.filter((item) => {
      const matchesSearch =
        item.CrewCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.crewName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRank = rankFilter === "all" || item.Rank === rankFilter;

      const matchesVessel =
        vesselFilter === "all" || item.VesselName === vesselFilter;

      return matchesSearch && matchesRank && matchesVessel;
    });
  }, [crewDeductionData, searchTerm, rankFilter, vesselFilter]);

  // Columns definition
  const crewDeductionColumns: ColumnDef<CrewDeduction>[] = [
    {
      accessorKey: "CrewCode",
      header: () => <div className="text-justify">Crew Code</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("CrewCode")}</div>
      ),
    },
    {
      accessorKey: "crewName",
      header: () => <div className="text-justify">Name</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("crewName")}</div>
      ),
    },
    {
      accessorKey: "VesselName",
      header: () => <div className="text-center">Vessel</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("VesselName")}</div>
      ),
    },
    {
      accessorKey: "Rank",
      header: () => <div className="text-center">Rank</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("Rank")}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
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
                    href={`/home/deduction/deduction-entries?tab=deduction-entries&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}>
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View Deduction Entries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link
                    href={`/home/deduction/deduction-entries?tab=hdmf-upgrade&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}>
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View HDMF Upgrade Contributions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link
                    href={`/home/deduction/deduction-entries?tab=philhealth&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}>
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View PhilHealth Contributions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link
                    href={`/home/deduction/deduction-entries?tab=sss&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}>
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View SSS Contributions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="h-full w-full p-3 pt-3 overflow-hidden">
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

          /* Hide scrollbar for all scrollable elements in the component */
          .overflow-y-auto::-webkit-scrollbar,
          .overflow-auto::-webkit-scrollbar,
          .overflow-scroll::-webkit-scrollbar {
            display: none;
          }

          .overflow-y-auto,
          .overflow-auto,
          .overflow-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="h-full overflow-hidden">
          <div className="p-3 pt-0 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold mb-0">Crew Entries</h1>
            </div>

            <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                  <Input
                    placeholder="Search crew by name, rank, vessel..."
                    className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                  <Select
                    value={vesselFilter}
                    onValueChange={setVesselFilter}
                    disabled={isLoading.vessels}>
                    <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                      {isLoading.vessels ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                      )}
                      <SelectValue
                        defaultValue="all"
                        placeholder="All Vessels"
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="all">All Vessels</SelectItem>
                      {vessels.map((vessel) => (
                        <SelectItem
                          key={vessel.VesselID}
                          value={vessel.VesselName || ""}>
                          {vessel.VesselName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                  <Select
                    value={rankFilter}
                    onValueChange={setRankFilter}
                    disabled={isLoading.ranks}>
                    <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                      {isLoading.ranks ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                      )}
                      <SelectValue defaultValue="all" placeholder="All Ranks" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="all">All Ranks</SelectItem>
                      {ranks.map((rank) => (
                        <SelectItem
                          key={rank.RankID}
                          value={rank.RankName || ""}>
                          {rank.RankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* DataTable with custom styling */}
              <div className="bg-[#F9F9F9] rounded-md border pb-3">
                {isLoading.crew ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <DataTable
                    columns={crewDeductionColumns}
                    data={filteredCrewDeduction}
                    pageSize={8}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
