"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Ship,
  // Trash,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { TbShipOff } from "react-icons/tb";
import { MdOutlineBadge } from "react-icons/md";
import { PromoteCrewDialog } from "../dialogs/PromoteCrewDialog";
import { RepatriateCrewDialog } from "../dialogs/RepatriateCrewDialog";
import { IOffBoardCrew, SearchCrewDialog } from "../dialogs/SearchCrewDialog";
import { JoinCrewDialog } from "../dialogs/JoinCrewDialog";
// import Swal from "sweetalert2";
import {
  getVesselCrew,
  type VesselCrewResponse,
} from "@/src/services/vessel/vessel.api";

interface ISelectedCrew {
  id: number;
  name: string;
  status: string;
  rank: string;
  crewCode: string;
  currentVessel?: string;
  vesselId?: number;
  // signOnDate?: string;
  // currentVessel?: string;
}

export default function VesselCrewList() {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("id");
  const vesselName = searchParams.get("vesselName");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [vesselData, setVesselData] = useState<VesselCrewResponse | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [repatriateDialogOpen, setRepatriateDialogOpen] = useState(false);
  const [searchCrewDialogOpen, setSearchCrewDialogOpen] = useState(false);
  const [joinCrewDialogOpen, setJoinCrewDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<ISelectedCrew>();
  const [selectedOffBoardCrew, setSelectedOffBoardCrew] =
    useState<IOffBoardCrew | null>(null);

  useEffect(() => {
    const fetchVesselCrew = async () => {
      if (!vesselId) return;
      try {
        const response = await getVesselCrew(vesselId);
        setVesselData(response);
      } catch (error) {
        console.error("Error fetching vessel crew:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVesselCrew();
  }, [vesselId]);

  const crewData =
    vesselData?.data.Crew.map((crew, index) => ({
      id: index + 1,
      name: `${crew.FirstName} ${crew.MiddleName ? crew.MiddleName + " " : ""}${
        crew.LastName
      }`,
      status: crew.Status === 1 ? "On board" : "Inactive",
      rank: crew.Rank,
      crewCode: crew.CrewCode,
      country: crew.Country,
    })) || [];

  const columns: ColumnDef<(typeof crewData)[number]>[] = [
    {
      accessorKey: "crewCode",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Crew Code
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("crewCode")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Crew Name
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rank
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("rank")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer justify-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={`${
                status === "On board"
                  ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
              }`}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const crew = row.original;
        // const handleDelete = (vesselCode: string) => {
        //   const swalWithBootstrapButtons = Swal.mixin({
        //     customClass: {
        //       confirmButton:
        //         "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-2 rounded",
        //       cancelButton:
        //         "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
        //     },
        //     buttonsStyling: false,
        //   });

        //   swalWithBootstrapButtons
        //     .fire({
        //       title: "Are you sure?",
        //       text: "Are you sure you want to delete this crew in the crew list? This action cannot be undone.",
        //       icon: "warning",
        //       showCancelButton: true,
        //       confirmButtonText: "Yes, delete it!",
        //       cancelButtonText: "No, cancel!",
        //       reverseButtons: true,
        //     })
        //     .then((result) => {
        //       if (result.isConfirmed) {
        //         swalWithBootstrapButtons.fire({
        //           title: "Deleted!",
        //           text: "The crew member has been successfully deleted.",
        //           icon: "success",
        //         });
        //       } else if (result.dismiss === Swal.DismissReason.cancel) {
        //         swalWithBootstrapButtons.fire({
        //           title: "Cancelled",
        //           text: "Your crew member is safe :)",
        //           icon: "error",
        //         });
        //       }
        //     });
        // };

        console.log("Crew:", JSON.stringify(selectedCrew, null, 2));
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
                  }}>
                  <TbShipOff />
                  Repatriate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCrew(crew);
                    setPromoteDialogOpen(true);
                  }}>
                  <MdOutlineBadge />
                  For Promotion
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(crew.id.toString())}>
                  <Trash className="text-red-500" />
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full p-6 pt-5 overflow-hidden">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

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
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {vesselData?.data.VesselInfo.VesselCode}
              </div>
              <h2 className="text-2xl font-semibold">
                {vesselData?.data.VesselInfo.VesselName}
              </h2>
              <Badge
                variant="secondary"
                className={`mt-2 px-6 py-0 ${
                  vesselData?.data.VesselInfo.Status === 1
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                {vesselData?.data.VesselInfo.Status === 1
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {vesselData?.data.VesselInfo.VesselType}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm text-center">
                  <p className="flex items-center justify-center font-semibold px-3">
                    {vesselData?.data.VesselInfo.Principal}
                  </p>
                  <div className="text-gray-500 text-xs flex items-center justify-center">
                    Principal Name
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

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
              onClick={() => setSearchCrewDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Join Crew
            </Button>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              Loading...
            </div>
          ) : (
            <DataTable columns={columns} data={crewData} pageSize={6} />
          )}
        </div>
      </div>

      <PromoteCrewDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        crewMember={
          selectedCrew
            ? {
                ...selectedCrew,
                currentVessel: vesselName || "",
                vesselId: vesselId ? Number(vesselId) : 0,
              }
            : {
                id: 0,
                name: "",
                status: "",
                rank: "",
                crewCode: "",
                currentVessel: "",
                vesselId: 0,
              }
        }
      />

      <RepatriateCrewDialog
        open={repatriateDialogOpen}
        onOpenChange={setRepatriateDialogOpen}
        crewMember={
          selectedCrew
            ? {
                ...selectedCrew,
                currentVessel: vesselName || "",
                vesselId: vesselId ? Number(vesselId) : 0,
              }
            : {
                id: 0,
                name: "",
                status: "",
                rank: "",
                crewCode: "",
                currentVessel: "",
                vesselId: 0,
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
