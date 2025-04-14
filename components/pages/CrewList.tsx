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
import Swal from "sweetalert2";

// Sample crew data
const crewData = [
  {
    id: "CR001",
    name: "John Smith Alperen Segundo",
    rank: "Captain",
    status: "On board",
    vessel: "MV Pacific Voyager",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Seafarer St., Manila, Philippines",
    dateOfBirth: "1985-06-15",
    nationality: "Filipino",
    joinDate: "2023-01-10",
    contractEnd: "2023-07-10",
    accountValidation: "Verified",
  },
  {
    id: "CR002",
    name: "Emily Chen",
    rank: "First Officer",
    status: "On board",
    vessel: "MV Pacific Voyager",
    email: "emily.chen@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Ocean Ave., Singapore",
    dateOfBirth: "1990-03-22",
    nationality: "Singaporean",
    joinDate: "2023-02-15",
    contractEnd: "2023-08-15",
    accountValidation: "Not Registered",
  },
  {
    id: "CR003",
    name: "Michael Rodriguez",
    rank: "Chief Engineer",
    status: "Off board",
    vessel: "",
    email: "michael.rodriguez@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Marine Dr., Manila, Philippines",
    dateOfBirth: "1982-11-05",
    nationality: "Filipino",
    joinDate: "2022-10-05",
    contractEnd: "2023-04-05",
    accountValidation: "Verified",
  },
  {
    id: "CR004",
    name: "Sarah Johnson",
    rank: "Second Officer",
    status: "Active",
    vessel: "MV Atlantic Explorer",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 234-5678",
    address: "321 Sailor's Way, London, UK",
    dateOfBirth: "1988-09-12",
    nationality: "British",
    joinDate: "2023-03-20",
    contractEnd: "2023-09-20",
    accountValidation: "Not Registered",
  },
  {
    id: "CR005",
    name: "David Kim",
    rank: "Third Engineer",
    status: "Inactive",
    vessel: "",
    email: "david.kim@example.com",
    phone: "+1 (555) 345-6789",
    address: "567 Harbor Blvd., Busan, South Korea",
    dateOfBirth: "1992-04-30",
    nationality: "South Korean",
    joinDate: "2022-08-15",
    contractEnd: "2023-02-15",
    accountValidation: "Pending",
  },
  {
    id: "CR006",
    name: "Emily Brown",
    rank: "Cook",
    status: "Active",
    vessel: "MV Pacific Voyager",
    email: "emily.brown@example.com",
    phone: "+1 (555) 567-8901",
    address: "890 Culinary Lane, Manila, Philippines",
    dateOfBirth: "1991-08-18",
    nationality: "Filipino",
    joinDate: "2023-01-25",
    contractEnd: "2023-07-25",
    accountValidation: "Pending",
  },
  {
    id: "CR007",
    name: "Robert Garcia",
    rank: "Bosun",
    status: "Off board",
    vessel: "",
    email: "robert.garcia@example.com",
    phone: "+1 (555) 678-9012",
    address: "432 Mariner Blvd., Barcelona, Spain",
    dateOfBirth: "1987-12-03",
    nationality: "Spanish",
    joinDate: "2022-11-10",
    contractEnd: "2023-05-10",
    accountValidation: "Verified",
  },
  {
    id: "CR008",
    name: "Azraelu Calleja",
    rank: "Captain",
    status: "On board",
    vessel: "MV Atlantic Explorer",
    email: "asta.calleja@example.com",
    phone: "+1 (555) 789-0123",
    address: "654 Mariner Ave., Manila, Philippines",
    dateOfBirth: "1986-07-22",
    nationality: "Filipino",
    joinDate: "2023-02-01",
    contractEnd: "2023-08-01",
    accountValidation: "Not Registered",
  },
  {
    id: "CR009",
    name: "James Wilson",
    rank: "Second Engineer",
    status: "Active",
    vessel: "MV Pacific Voyager",
    email: "james.wilson@example.com",
    phone: "+1 (555) 890-1234",
    address: "789 Engineer St., Sydney, Australia",
    dateOfBirth: "1989-05-14",
    nationality: "Australian",
    joinDate: "2023-01-15",
    contractEnd: "2023-07-15",
    accountValidation: "Not Registered",
  },
  {
    id: "CR010",
    name: "Sophia Martinez",
    rank: "Third Officer",
    status: "Off board",
    vessel: "",
    email: "sophia.martinez@example.com",
    phone: "+1 (555) 901-2345",
    address: "321 Seafarer Blvd., Barcelona, Spain",
    dateOfBirth: "1993-09-28",
    nationality: "Spanish",
    joinDate: "2022-12-10",
    contractEnd: "2023-06-10",
    accountValidation: "Verified",
  },
  {
    id: "CR011",
    name: "Daniel Lee",
    rank: "Electrician",
    status: "Inactive",
    vessel: "",
    email: "daniel.lee@example.com",
    phone: "+1 (555) 012-3456",
    address: "456 Electric Ave., Seoul, South Korea",
    dateOfBirth: "1990-11-03",
    nationality: "South Korean",
    joinDate: "2022-09-20",
    contractEnd: "2023-03-20",
    accountValidation: "Pending",
  },
  {
    id: "CR012",
    name: "Olivia Thompson",
    rank: "Chief Officer",
    status: "On board",
    vessel: "MV Atlantic Explorer",
    email: "olivia.thompson@example.com",
    phone: "+1 (555) 123-4567",
    address: "789 Officer St., London, UK",
    dateOfBirth: "1987-03-17",
    nationality: "British",
    joinDate: "2023-03-01",
    contractEnd: "2023-09-01",
    accountValidation: "Verified",
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
    case "verified":
      return "bg-[#E7F0F9] text-[#1D237A] rounded-full";
    case "not registered":
      return "bg-[#989898] text-white rounded-full";
    case "pending":
      return "bg-[#EBEBEB] text-black rounded-full";
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
    accessorKey: "name",
    header: "Crew Name",
    cell: ({ row }) => (
      <div className="text-xs sm:text-sm text-center">
        {row.getValue("name")}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={`mx-auto justify-center text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 flex items-center gap-1.5 sm:gap-2 w-24 sm:w-28 ${getStatusBgColor(
              status
            )}`}
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "accountValidation",
    header: "Account Validation",
    cell: ({ row }) => {
      const accountValidation = row.getValue("accountValidation") as string;
      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={`mx-auto justify-center text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 flex items-center gap-1.5 sm:gap-2 w-24 sm:w-28 ${getStatusBgColor(
              accountValidation
            )}`}
          >
            {accountValidation}
          </Badge>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const crew = row.original;

      // Function that displays SweetAlert2 confirmation when deleting a crew member
      const handleDelete = (crewId: string) => {
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
            text: "Are you sure you want to delete this crew member? This action cannot be undone.",
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
                text: "The crew has been successfully deleted.",
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
              <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs sm:text-sm">
              <DropdownMenuItem asChild className="text-xs sm:text-sm">
                <Link href={`/home/crew/details?id=${crew.id}`}>
                  <IdCard className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  View Crew Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs sm:text-sm">
                <Link href={`/home/crew/details?id=${crew.id}&tab=movement`}>
                  <FolderClock className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  View Crew Movement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs sm:text-sm">
                <Link href={`/home/crew/details?id=${crew.id}&tab=allottee`}>
                  <Users className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  View Allottee
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs sm:text-sm">
                <Link href={`/home/crew/details?id=${crew.id}&tab=validation`}>
                  <Users className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  View Account Validation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(crew.id)}
                className="text-destructive text-xs sm:text-sm cursor-pointer"
              >
                <Trash className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function CrewList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [validationFilter, setValidationFilter] = useState("all");

  // Filter crew based on search term and status filter
  const filteredCrew = crewData.filter((crew) => {
    const matchesSearch =
      crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.rank.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      crew.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesRank =
      rankFilter === "all" ||
      crew.rank.toLowerCase() === rankFilter.toLowerCase();

    const matchesValidation =
      validationFilter === "all" ||
      (crew.accountValidation ?? "").toLowerCase() ===
        validationFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesRank && matchesValidation;
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
            <h1 className="text-3xl font-semibold mb-0">Crew List</h1>
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
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Filter by status</SelectItem>
                  <SelectItem value="On board">On board</SelectItem>
                  <SelectItem value="Off board">Off Board</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Filter by rank</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="First Officer">First Officer</SelectItem>
                  <SelectItem value="Second Officer">Second Officer</SelectItem>
                  <SelectItem value="Third Officer">Third Officer</SelectItem>
                  <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
                  <SelectItem value="Second Engineer">
                    Second Engineer
                  </SelectItem>
                  <SelectItem value="Third Engineer">Third Engineer</SelectItem>
                  <SelectItem value="Bosun">Bosun</SelectItem>
                  <SelectItem value="Electrician">Electrician</SelectItem>
                  <SelectItem value="Cook">Cook</SelectItem>
                  <SelectItem value="Deckhand">Deckhand</SelectItem>
                  <SelectItem value="Steward">Steward</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={validationFilter}
                onValueChange={setValidationFilter}
              >
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Filter by validation</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Not Registered">Not Registered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Link href="/home/crew/add-crew">
                <Button
                  className="whitespace-nowrap h-9 sm:h-10 px-5 sm:px-7 text-xs sm:text-sm w-full sm:w-auto"
                  size="default"
                >
                  <Plus className="mr-3 sm:mr-5 h-4 sm:h-4.5 w-4 sm:w-4.5" />{" "}
                  <p className="mr-4">Add Crew</p>
                </Button>
              </Link>
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
