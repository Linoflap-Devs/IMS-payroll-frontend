"use client";

import { useState } from "react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash,
  Filter,
  IdCard,
  FolderClock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Sample crew data
const crewData = [
  {
    id: 2121,
    crewName: "John Doe",
    rank: "Captain",
    vessel: "Vessel A",
  },
  {
    id: 2122,
    crewName: "Jane Smith",
    rank: "First Officer",
    vessel: "Vessel B",
  },
  {
    id: 2123,
    crewName: "Alice Johnson",
    rank: "Second Officer",
    vessel: "Vessel C",
  },
  {
    id: 2124,
    crewName: "Bob Brown",
    rank: "Chief Engineer",
    vessel: "Vessel D",
  },
  {
    id: 2125,
    crewName: "Charlie Davis",
    rank: "Electrician",
    vessel: "Vessel E",
  },
  {
    id: 2126,
    crewName: "David Wilson",
    rank: "Chief Cook",
    vessel: "Vessel F",
  },
  {
    id: 2127,
    crewName: "Eva Garcia",
    rank: "Steward",
    vessel: "Vessel G",
  },
  {
    id: 2128,
    crewName: "Frank Martinez",
    rank: "Deckhand",
    vessel: "Vessel H",
  },
  {
    id: 2129,
    crewName: "Grace Lee",
    rank: "Bosun",
    vessel: "Vessel I",
  },
  {
    id: 2130,
    crewName: "Henry Walker",
    rank: "Able Seaman",
    vessel: "Vessel J",
  },
];

const getStatusBgColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "on board":
      return "bg-[#EBF5E4] text-green-800 rounded-full";
    case "off board":
      return "bg-[#F5ECE4] text-yellow-800 rounded-full";
    case "active":
      return "bg-[#e4e5f5] text-blue-800 rounded-full";
    case "inactive":
      return "bg-[#f5e4e4] text-red-800 rounded-full";
    default:
      return "bg-gray-100 text-gray-800 rounded-full";
  }
};

// Define the columns for the DataTable
type Crew = (typeof crewData)[number];

const columns: ColumnDef<Crew>[] = [
  {
    accessorKey: "id",
    header: "Crew Code",
    cell: ({ row }) => (
      <div className="font-medium text-xs sm:text-sm text-center">
        {row.getValue("id")}
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
                  )}&rank=${encodeURIComponent(
                    crew.rank
                  )}&vessel=${encodeURIComponent(
                    crew.vessel
                  )}&crewCode=${encodeURIComponent(crew.id)}`}
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

export default function Remittance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter crew based on search term and status filter
  const filteredCrew = crewData.filter((crew) => {
    const matchesSearch =
      crew.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.id ||
      crew.rank.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="On board">On board</SelectItem>
                  <SelectItem value="Off board">Off Board</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DataTable with custom styling */}
          <div className="bg-white rounded-md border pb-3">
            <DataTable columns={columns} data={filteredCrew} />
          </div>
        </div>
      </div>
    </div>
  );
}
