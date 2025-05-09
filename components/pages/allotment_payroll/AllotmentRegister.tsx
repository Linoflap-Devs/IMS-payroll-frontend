"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Ship,
  Car,
  Trash,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../../ui/card";
import { TbShipOff } from "react-icons/tb";
import { MdOutlineBadge } from "react-icons/md";
import { PromoteCrewDialog } from "../../dialogs/PromoteCrewDialog";
import { RepatriateCrewDialog } from "../../dialogs/RepatriateCrewDialog";
import { SearchCrewDialog } from "../../dialogs/SearchCrewDialog";
import { JoinCrewDialog } from "../../dialogs/JoinCrewDialog";
import Swal from "sweetalert2";

// Sample crew data
const crewData = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    rank: "Captain",
    country: "Japan",
    signOnDate: "10-23-25",
  },
  {
    id: 2,
    name: "Seki Chan",
    rank: "Captain",
    country: "Singapore",
    signOnDate: "10-23-25",
  },
  {
    id: 3,
    name: "Azraelu Asta",
    rank: "Captain",
    country: "Singapore",
    signOnDate: "10-23-25",
  },
  {
    id: 4,
    name: "Follie Rendel",
    rank: "Captain",
    country: "Japan",
    signOnDate: "10-23-25",
  },
  {
    id: 5,
    name: "Axel Magniyo",
    rank: "Captain",
    country: "Japan",
    signOnDate: "10-23-25",
  },
  {
    id: 6,
    name: "John Luffy",
    rank: "Captain",
    country: "Singapore",
    signOnDate: "10-23-25",
  },
  {
    id: 7,
    name: "Clara Magpantay",
    rank: "Captain",
    country: "Singapore",
    signOnDate: "10-23-25",
  },
  {
    id: 8,
    name: "Thomas Shelby",
    rank: "Captain",
    country: "Singapore",
    signOnDate: "10-23-25",
  },
];

type Crew = (typeof crewData)[number];

interface VesselInfo {
  code: string;
  name: string;
  type: string;
  principalName: string;
}

interface VesselCrewListProps {
  vesselInfo?: VesselInfo;
}

export default function VesselCrewList({ vesselInfo }: VesselCrewListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [repatriateDialogOpen, setRepatriateDialogOpen] = useState(false);
  const [searchCrewDialogOpen, setSearchCrewDialogOpen] = useState(false);
  const [joinCrewDialogOpen, setJoinCrewDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedOffBoardCrew, setSelectedOffBoardCrew] = useState<any>(null);

  const columns: ColumnDef<Crew>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Crew Name
          </div>
        );
      },
    },
    {
      accessorKey: "rank",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rank
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Country
          </div>
        );
      },
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        const flag = country === "Japan" ? "🇯🇵" : "🇸🇬";
        return (
          <div className="flex items-center gap-2">
            <span>{flag}</span>
            <span>{country}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "signOnDate",
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sign on date
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const crew = row.original;
        // Function that displays SweetAlert2 confirmation when deleting a crew member
        const handleDelete = (vesselCode: string) => {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton:
                "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-2 rounded",
              cancelButton:
                "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
            },
            buttonsStyling: false,
          });

          swalWithBootstrapButtons
            .fire({
              title: "Are you sure?",
              text: "Are you sure you want to delete this crew in the crew list? This action cannot be undone.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
              cancelButtonText: "No, cancel!",
              reverseButtons: true,
            })
            .then((result) => {
              if (result.isConfirmed) {
                // Place your delete logic here, for example, API call or state update
                swalWithBootstrapButtons.fire({
                  title: "Deleted!",
                  text: "The crew member has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your crew member is safe :)",
                  icon: "error",
                });
              }
            });
        };
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCrew(crew);
                    setRepatriateDialogOpen(true);
                  }}
                >
                  <TbShipOff />
                  Repatriate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCrew(crew);
                    setPromoteDialogOpen(true);
                  }}
                >
                  <MdOutlineBadge />
                  For Promotion
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(crew.id.toString())}
                >
                  <Trash className="text-red-500" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Filter crew based on search term
  const filteredCrew = crewData.filter((crew) =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full p-6 pt-5 overflow-hidden">
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
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2">
          <Link href="/home/vessel">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold mb-0">Vessel Crew List</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Vessel Info Card */}
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {vesselInfo?.code || "AMAK"}
              </div>
              <h2 className="text-2xl font-semibold">
                {vesselInfo?.name || "Amakus Island"}
              </h2>
              <Badge
                variant="secondary"
                className="mt-2 px-6 py-0 bg-[#DFEFFE] text-[#292F8C]"
              >
                Active
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {vesselInfo?.type || "Bulk Jap, Flag"}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm  text-center">
                  <p className="flex items-center justify-center font-semibold">
                    {vesselInfo?.principalName || "Iino Marine"}
                  </p>
                  <div className="text-gray-500 text-xs flex items-center justify-center">
                    Principal Name
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Search and Actions */}
        <div className="flex justify-between items-center gap-4 mt-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search Crew...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-[#EAEBF9]"
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="gap-2 h-11 px-5">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button
              className="gap-2 h-11 px-5"
              onClick={() => setSearchCrewDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Join Crew
            </Button>
          </div>
        </div>

        {/* Crew Table */}
        <div className="rounded-md border pb-3">
          <DataTable columns={columns} data={filteredCrew} pageSize={6} />
        </div>
      </div>

      <PromoteCrewDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        crewMember={
          selectedCrew
            ? {
                name: selectedCrew.name,
                rank: selectedCrew.rank,
                signOnDate: selectedCrew.signOnDate,
                currentVessel: vesselInfo?.name || "Atlas Island",
              }
            : {
                name: "",
                rank: "",
                signOnDate: "",
                currentVessel: vesselInfo?.name || "Atlas Island",
              }
        }
      />

      <RepatriateCrewDialog
        open={repatriateDialogOpen}
        onOpenChange={setRepatriateDialogOpen}
        crewMember={
          selectedCrew
            ? {
                name: selectedCrew.name,
                rank: selectedCrew.rank,
                signOnDate: selectedCrew.signOnDate,
                currentVessel: vesselInfo?.name || "Atlas Island",
              }
            : {
                name: "",
                rank: "",
                signOnDate: "",
                currentVessel: vesselInfo?.name || "Atlas Island",
              }
        }
      />

      <SearchCrewDialog
        open={searchCrewDialogOpen}
        onOpenChange={setSearchCrewDialogOpen}
        onCrewSelect={(crew) => {
          setSelectedOffBoardCrew(crew);
          setJoinCrewDialogOpen(true);
        }}
      />

      {selectedOffBoardCrew && (
        <JoinCrewDialog
          open={joinCrewDialogOpen}
          onOpenChange={setJoinCrewDialogOpen}
          crewMember={selectedOffBoardCrew}
        />
      )}
    </div>
  );
}
