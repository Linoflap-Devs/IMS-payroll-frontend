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
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddVesselDialog } from "../dialogs/AddVesselDialog";
import { EditVesselDialog } from "../dialogs/EditVesselDialog";
import { AddVesselTypeDialog } from "../dialogs/AddVesselTypeDialog";
import { EditVesselTypeDialog } from "../dialogs/EditVesselTypeDialog";
import { AddVesselPrincipalDialog } from "../dialogs/AddVesselPrincipalDialog";
import { EditVesselPrincipalDialog } from "../dialogs/EditVesselPrincipalDialog";
import Swal from "sweetalert2";

// Sample crew data
const vesselData = [
  {
    vesselCode: "CR001",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR002",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR003",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Inactive",
  },
  {
    vesselCode: "CR004",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Inactive",
  },
  {
    vesselCode: "CR005",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR006",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR007",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR008",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR009",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR010",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR011",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
  {
    vesselCode: "CR012",
    vesselName: "MV Pacific Voyager",
    vesselType: "Tanker",
    principalName: "John Smith",
    status: "Active",
  },
];

const vesselTypeData = [
  {
    vesselType: "Tanker",
    vesselTypeCode: "TK",
  },
  {
    vesselType: "Bulk Carrier",
    vesselTypeCode: "BC",
  },
  {
    vesselType: "Container Ship",
    vesselTypeCode: "CS",
  },
  {
    vesselType: "Passenger Ship",
    vesselTypeCode: "PS",
  },
  {
    vesselType: "Tugboat",
    vesselTypeCode: "TB",
  },

  {
    vesselType: "Trawler",
    vesselTypeCode: "TR",
  },
  {
    vesselType: "Fishing Vessel",
    vesselTypeCode: "FV",
  },
  {
    vesselType: "Research Vessel",
    vesselTypeCode: "RV",
  },
  {
    vesselType: "Supply Vessel",
    vesselTypeCode: "SV",
  },
  {
    vesselType: "Other",
    vesselTypeCode: "OT",
  },
  {
    vesselType: "Tanker",
    vesselTypeCode: "TK",
  },
  {
    vesselType: "Tanker",
    vesselTypeCode: "TK",
  },
  {
    vesselType: "Tanker",
    vesselTypeCode: "TK",
  },
];

const vesselPrincipalData = [
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
  {
    vesselPrincipalCode: "IINO",
    vesselPrincipalName: "Iino Shipping Co., Ltd.",
  },
];

const getStatusBgColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-[#e4e5f5] text-blue-800 rounded-full";
    case "inactive":
      return "bg-[#f5e4e4] text-red-800 rounded-full";
    default:
      return "bg-gray-100 text-gray-800 rounded-full";
  }
};

// Define the columns for the DataTable
type Vessel = (typeof vesselData)[number];
type VesselType = (typeof vesselTypeData)[number];
type VesselPrincipal = (typeof vesselPrincipalData)[number];

export default function VesselProfile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("vessel");
  const [addVesselDialogOpen, setAddVesselDialogOpen] = useState(false);
  const [editVesselDialogOpen, setEditVesselDialogOpen] = useState(false);
  const [addVesselTypeDialogOpen, setAddVesselTypeDialogOpen] = useState(false);
  const [editVesselTypeDialogOpen, setEditVesselTypeDialogOpen] =
    useState(false);
  const [addVesselPrincipalDialogOpen, setAddVesselPrincipalDialogOpen] =
    useState(false);
  const [editVesselPrincipalDialogOpen, setEditVesselPrincipalDialogOpen] =
    useState(false);
  const [selectedVessel, setSelectedVessel] = useState<
    (typeof vesselData)[0] | null
  >(null);
  const [selectedVesselType, setSelectedVesselType] = useState<
    (typeof vesselTypeData)[0] | null
  >(null);
  const [selectedVesselPrincipal, setSelectedVesselPrincipal] = useState<
    (typeof vesselPrincipalData)[0] | null
  >(null);

  const columns: ColumnDef<Vessel>[] = [
    {
      accessorKey: "vesselCode",
      header: ({ column }) => <div className="text-justify">Vessel Code</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselCode")}</div>
      ),
    },
    {
      accessorKey: "vesselName",
      header: ({ column }) => <div className="text-justify">Vessel Name</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselName")}</div>
      ),
    },
    {
      accessorKey: "vesselType",
      header: ({ column }) => <div className="text-justify">Vessel Type</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselType")}</div>
      ),
    },
    {
      accessorKey: "principalName",
      header: ({ column }) => (
        <div className="text-justify">Principal Name</div>
      ),
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("principalName")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <div className="text-justify">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="text-justify">
            <Badge variant="outline" className={getStatusBgColor(status)}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-justify">Actions</div>,
      cell: ({ row }) => {
        const vessel = row.original;
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
              text: "Are you sure you want to delete this vessel? This action cannot be undone.",
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
                  text: "The vessel has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your vessel is safe :)",
                  icon: "error",
                });
              }
            });
        };
        return (
          <div className="text-justify">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedVessel(vessel);
                    setEditVesselDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Vessel
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <Link href={`/home/vessel/crew-list`}>
                    <Users className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    View Crew List
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(vessel.vesselCode)}
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

  const columnsVesselType: ColumnDef<VesselType>[] = [
    {
      accessorKey: "vesselTypeCode",
      header: ({ column }) => (
        <div className="text-justify">Vessel Type Code</div>
      ),
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselTypeCode")}</div>
      ),
    },
    {
      accessorKey: "vesselType",
      header: ({ column }) => <div className="text-justify">Vessel Type</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("vesselType")}</div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-justify">Actions</div>,
      cell: ({ row }) => {
        const vesselType = row.original;
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
              text: "Are you sure you want to delete this vessel type? This action cannot be undone.",
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
                  text: "The vessel type has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your vessel type is safe :)",
                  icon: "error",
                });
              }
            });
        };
        return (
          <div className="text-justify">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedVesselType(vesselType);
                    setEditVesselTypeDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Vessel Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(vesselType.vesselTypeCode)}
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

  const columnsVesselPrincipal: ColumnDef<VesselPrincipal>[] = [
    {
      accessorKey: "vesselPrincipalCode",
      header: ({ column }) => (
        <div className="text-justify">Vessel Principal Code</div>
      ),
      cell: ({ row }) => (
        <div className="text-justify">
          {row.getValue("vesselPrincipalCode")}
        </div>
      ),
    },
    {
      accessorKey: "vesselPrincipalName",
      header: ({ column }) => (
        <div className="text-justify">Vessel Principal Name</div>
      ),
      cell: ({ row }) => (
        <div className="text-justify">
          {row.getValue("vesselPrincipalName")}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-justify">Actions</div>,
      cell: ({ row }) => {
        const vesselPrincipal = row.original;
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
              text: "Are you sure you want to delete this vessel principal? This action cannot be undone.",
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
                  text: "The vessel principal has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your vessel principal is safe :)",
                  icon: "error",
                });
              }
            });
        };
        return (
          <div className="text-justify">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedVesselPrincipal(vesselPrincipal);
                    setEditVesselPrincipalDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Vessel Principal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() =>
                    handleDelete(vesselPrincipal.vesselPrincipalCode)
                  }
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

  // Filter crew based on search term and status filter
  const filteredVessel = vesselData.filter((vessel) => {
    const matchesSearch =
      vessel.vesselCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.vesselType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      vessel.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredVesselType = vesselTypeData.filter((vesselType) => {
    const matchesSearch = vesselType.vesselType
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const filteredVesselPrincipal = vesselPrincipalData.filter(
    (vesselPrincipal) => {
      const matchesSearch = vesselPrincipal.vesselPrincipalName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSearch;
    }
  );
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
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
            <h1 className="text-3xl font-semibold mb-0">Vessel Profile</h1>
          </div>

          <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full flex flex-col h-full"
            >
              <div className="border-b">
                <div className="px-4 pt-1">
                  <TabsList className="bg-transparent p-0 h-8 w-full flex justify-start space-x-8">
                    <TabsTrigger
                      value="vessel"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Vessel
                    </TabsTrigger>
                    <TabsTrigger
                      value="vessel-type"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Vessel Type
                    </TabsTrigger>
                    <TabsTrigger
                      value="vessel-principal"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Vessel Principal
                    </TabsTrigger>
                    {/* <TabsTrigger
                      value="sea-port"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Sea Port
                    </TabsTrigger> */}
                  </TabsList>
                </div>
              </div>

              <TabsContent
                value="vessel"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                          <Filter className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        className="whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
                        size="default"
                        onClick={() => setAddVesselDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />{" "}
                        Add Vessel
                      </Button>
                    </div>
                  </div>
                  {/* DataTable with custom styling */}
                  <div className="bg-[#F9F9F9] rounded-md border pb-3">
                    <DataTable
                      columns={columns}
                      data={filteredVessel}
                      pageSize={7}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="vessel-type"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
                      <Button
                        className="whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
                        size="default"
                        onClick={() => setAddVesselTypeDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />{" "}
                        Add Vessel Type
                      </Button>
                    </div>
                  </div>
                  {/* DataTable with custom styling */}
                  <div className="bg-[#F9F9F9] rounded-md border pb-3">
                    <DataTable
                      columns={columnsVesselType}
                      data={filteredVesselType}
                      pageSize={7}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="vessel-principal"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
                      <Button
                        className="whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
                        size="default"
                        onClick={() => setAddVesselPrincipalDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />{" "}
                        Add Vessel Principal
                      </Button>
                    </div>
                  </div>
                  {/* DataTable with custom styling */}
                  <div className="bg-[#F9F9F9] rounded-md border pb-3">
                    <DataTable
                      columns={columnsVesselPrincipal}
                      data={filteredVesselPrincipal}
                      pageSize={7}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Add Vessel Dialog */}
      <AddVesselDialog
        open={addVesselDialogOpen}
        onOpenChange={setAddVesselDialogOpen}
      />

      {/* Edit Vessel Dialog */}
      {selectedVessel && (
        <EditVesselDialog
          open={editVesselDialogOpen}
          onOpenChange={setEditVesselDialogOpen}
          vesselData={selectedVessel}
        />
      )}

      {/* Add Vessel Type Dialog */}
      <AddVesselTypeDialog
        open={addVesselTypeDialogOpen}
        onOpenChange={setAddVesselTypeDialogOpen}
      />

      {/* Edit Vessel Type Dialog */}
      {selectedVesselType && (
        <EditVesselTypeDialog
          open={editVesselTypeDialogOpen}
          onOpenChange={setEditVesselTypeDialogOpen}
          vesselTypeData={selectedVesselType}
        />
      )}

      {/* Add Vessel Principal Dialog */}
      <AddVesselPrincipalDialog
        open={addVesselPrincipalDialogOpen}
        onOpenChange={setAddVesselPrincipalDialogOpen}
      />

      {/* Edit Vessel Principal Dialog */}
      {selectedVesselPrincipal && (
        <EditVesselPrincipalDialog
          open={editVesselPrincipalDialogOpen}
          onOpenChange={setEditVesselPrincipalDialogOpen}
          vesselPrincipalData={selectedVesselPrincipal}
        />
      )}
    </div>
  );
}
