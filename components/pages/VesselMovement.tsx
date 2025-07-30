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
import { Search, MoreHorizontal, Filter, UserPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/lib/useDebounce";
import { getVesselList, VesselItem } from "@/src/services/vessel/vessel.api";

interface Vessel {
  vesselId: number;
  vesselCode: string;
  vesselName: string;
  vesselType: number;
  vesselTypeName: string;
  principalName: string;
  principalID: number;
  status: string;
}

export default function VesselMovement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [loading, setLoading] = useState(false);
  const [loadingVessels, setLoadingVessels] = useState(false);
  const [vesselData, setVesselData] = useState<Vessel[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vesselTypeFilter, setVesselTypeFilter] = useState("all");

  // Fetch vessel list on mount
  useEffect(() => {
    const fetchVessels = async () => {
      setLoadingVessels(true);
      try {
        const res = await getVesselList();
        if (res.success) {
          const mapped = res.data.map((item: VesselItem) => ({
            vesselId: item.VesselID,
            vesselCode: item.VesselCode,
            vesselName: item.VesselName,
            vesselType: parseInt(item.VesselType),
            vesselTypeName: item.VesselType,
            principalName: item.Principal,
            principalID: parseInt(item.Principal),
            status: item.IsActive === 1 ? "Active" : "Inactive",
          }));
          setVesselData(mapped);
        } else {
          console.error("Failed to fetch vessels:", res.message);
        }
      } catch (err) {
        console.error("Error fetching vessels:", err);
      } finally {
        setLoadingVessels(false);
      }
    };

    fetchVessels();
  }, []);

  const columns: ColumnDef<Vessel>[] = [
    {
      accessorKey: "vesselCode",
      header: () => <div className="text-justify">Vessel Code</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselCode")}</div>
      ),
    },
    {
      accessorKey: "vesselName",
      header: () => <div className="text-justify">Vessel Name</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselName")}</div>
      ),
    },
    {
      accessorKey: "vesselTypeName",
      header: () => <div className="text-justify">Vessel Type</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselTypeName")}</div>
      ),
    },
    {
      accessorKey: "principalName",
      header: () => <div className="text-justify">Principal Name</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("principalName")}</div>
      ),
    },
    
    {
      accessorKey: "status",
      header: () => <div className="text-justify">Status</div>,
      cell: ({ row }) => {
        const statusRow = row.getValue("status") as string;
        return (
          <div className="text-justify">
            <Badge
              className={`text-xs sm:text-sm w-full rounded-full bg-[#E7F0F9] text-[#1F279C]/90 ${statusRow === "Active"
                ? "bg-[#E7F0F9] text-[#1F279C]/90"
                : "bg-red-500/20 text-red-800"
                }`}
            >
              {statusRow}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const vessel = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem asChild>
                <Link
                  href={`/home/vessel-movement/crew-list?id=${vessel.vesselId}&vesselName=${vessel.vesselName}`}>
                  <UserPen className="mr-2 h-4 w-4" /> Manage Crew List
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filter vessels based on search and status
  const filteredVessel = vesselData.filter((v) => {
    const matchesSearch =
      v.vesselCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vesselTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.principalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      v.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesVesselType =
      vesselTypeFilter === "all" ||
      v.vesselTypeName.toLowerCase() === vesselTypeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesVesselType;
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Vessel Movement</h1>
          </div>
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
              <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                  <SelectValue placeholder="Filter by vessel" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Vessel Types</SelectItem>
                  {[
                    ...new Set(
                      vesselData.map((item) => item.vesselTypeName)
                    ),
                  ].map((vesselTypeName) => (
                    <SelectItem key={vesselTypeName} value={String(vesselTypeName || "")}>
                      {vesselTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                  <SelectValue placeholder="Filter by vessel" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Status</SelectItem>
                  {[
                    ...new Set(
                      vesselData.map((item) => item.status)
                    ),
                  ].map((Status) => (
                    <SelectItem key={Status} value={String(Status || "")}>
                      {Status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-center">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                Loading...
              </div>
            ) : (
              <DataTable columns={columns} data={filteredVessel} pageSize={10} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
