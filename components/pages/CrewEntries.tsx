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
  Pencil,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiUserListFill } from "react-icons/pi";
import { AddDeductionTypeDialog } from "@/components/dialogs/AddDeductionTypeDialog";
import { EditDeductionTypeDialog } from "@/components/dialogs/EditDeductionTypeDialog";
import Swal from "sweetalert2";
import {
  getCrewDeductionList,
  CrewDeductionItem,
} from "@/src/services/deduction/crewDeduction.api";

const deductionDescriptionData = [
  {
    deductionCode: "DED001",
    deductionName: "Deduction 1",
    deductionType: "Percentage",
    currency: "PHP",
  },
  {
    deductionCode: "DED002",
    deductionName: "Deduction 2",
    deductionType: "Fixed Amount",
    currency: "PHP",
  },
  {
    deductionCode: "DED003",
    deductionName: "Deduction 3",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED004",
    deductionName: "Deduction 4",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED005",
    deductionName: "Deduction 5",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED006",
    deductionName: "Deduction 6",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED007",
    deductionName: "Deduction 7",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED008",
    deductionName: "Deduction 8",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED009",
    deductionName: "Deduction 9",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED010",
    deductionName: "Deduction 10",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED011",
    deductionName: "Deduction 11",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED012",
    deductionName: "Deduction 12",
    deductionType: "Loan Type",
    currency: "PHP",
  },
  {
    deductionCode: "DED013",
    deductionName: "Deduction 13",
    deductionType: "Loan Type",
    currency: "PHP",
  },
];

type CrewDeduction = {
  CrewCode: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Rank: string;
  VesselName: string;
  crewName: string;
};
type DeductionDescription = (typeof deductionDescriptionData)[number];

export default function Deduction() {
  const [activeTab, setActiveTab] = useState("crew-deduction");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDeductionTypeDialogOpen, setAddDeductionTypeDialogOpen] =
    useState(false);
  const [selectedDeduction, setSelectedDeduction] =
    useState<DeductionDescription | null>(null);

  const [crewDeductionData, setCrewDeductionData] = useState<CrewDeduction[]>(
    []
  );

  useEffect(() => {
    getCrewDeductionList()
      .then((res) => {
        if (res.success) {
          const mapped: CrewDeduction[] = res.data.map((item) => ({
            ...item, // Spread all the original properties
            crewName: `${item.FirstName} ${item.MiddleName} ${item.LastName}`, // Add the computed property
          }));
          setCrewDeductionData(mapped);
        } else {
          console.error("Failed to fetch crew deduction:", res.message);
        }
      })
      .catch((err) => console.error("Error fetching crew deduction:", err));
  }, []); // Add empty dependency array to run only once on mount

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const crewDeductionColumns: ColumnDef<CrewDeduction>[] = [
    {
      accessorKey: "CrewCode",
      header: ({ column }) => <div className="text-justify">Crew Code</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("CrewCode")}</div>
      ),
    },
    {
      accessorKey: "crewName",
      header: ({ column }) => <div className="text-justify">Name</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("crewName")}</div>
      ),
    },
    {
      accessorKey: "VesselName",
      header: ({ column }) => <div className="text-center">Vessel</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("VesselName")}</div>
      ),
    },
    {
      accessorKey: "Rank",
      header: ({ column }) => <div className="text-center">Rank</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("Rank")}</div>
      ),
    },

    {
      accessorKey: "actions",
      header: ({ column }) => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const vessel = row.original;
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
                    href={`/home/deduction/deduction-entries?&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}
                  >
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View Deduction Entries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link
                    href={`/home/deduction/deduction-entries?tab=hdmf-upgrade&&crewCode=${encodeURIComponent(
                      row.getValue("CrewCode")
                    )}`}
                  >
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View HDMF Upgrade Contributions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link href={`/`}>
                    <PiUserListFill className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
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

  const deductionDescriptionColumns: ColumnDef<DeductionDescription>[] = [
    {
      accessorKey: "deductionCode",
      header: ({ column }) => (
        <div className="text-justify">Deduction Code</div>
      ),
      cell: ({ row }) => {
        const deduction = row.original;
        return <div className="text-justify">{deduction.deductionCode}</div>;
      },
    },
    {
      accessorKey: "deductionName",
      header: ({ column }) => (
        <div className="text-justify">Deduction Name</div>
      ),
      cell: ({ row }) => {
        const deduction = row.original;
        return <div className="text-justify">{deduction.deductionName}</div>;
      },
    },
    {
      accessorKey: "deductionType",
      header: ({ column }) => (
        <div className="text-justify">Deduction Type</div>
      ),
      cell: ({ row }) => {
        const deduction = row.original;
        return <div className="text-justify">{deduction.deductionType}</div>;
      },
    },
    {
      accessorKey: "currency",
      header: ({ column }) => <div className="text-justify">Currency</div>,
      cell: ({ row }) => {
        const deduction = row.original;
        return <div className="text-justify">{deduction.currency}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const deduction = row.original;
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
              text: "Are you sure you want to delete this crew in the deduction? This action cannot be undone.",
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
                  text: "The deduction has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your deduction is safe :)",
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
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedDeduction(deduction);
                    setEditDialogOpen(true);
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(deduction.deductionCode)}
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

  const filteredCrewDeduction = crewDeductionData.filter((item) =>
    item.CrewCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDeductionDescription = deductionDescriptionData.filter((item) =>
    item.deductionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                      <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rank</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* DataTable with custom styling */}
              <div className="bg-[#F9F9F9] rounded-md border pb-3">
                <DataTable
                  columns={crewDeductionColumns}
                  data={filteredCrewDeduction}
                  pageSize={8}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddDeductionTypeDialog
        open={addDeductionTypeDialogOpen}
        onOpenChange={setAddDeductionTypeDialogOpen}
      />
      {selectedDeduction && (
        <EditDeductionTypeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          deduction={selectedDeduction}
        />
      )}
    </>
  );
}
