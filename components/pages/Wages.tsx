"use client";

import { useState, useEffect } from "react";
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
import { EditSalaryScaleDialog } from "@/components/dialogs/EditSalaryScaleDialog";
import { EditWageDescriptionDialog } from "@/components/dialogs/EditWageDescriptionDialog";
import { EditForexDialog } from "@/components/dialogs/EditForexDialog";
import Swal from "sweetalert2";
import { SalaryScaleItem, getSalaryScaleList } from "../../src/services/wages/salaryScale.api";
import { WageDescriptionItem, getWageDescriptionList } from "../../src/services/wages/wageDescription.api";

// Define vessel type interface
type VesselType = {
  id: number;
  name: string;
};

type SalaryScaleData = {
  rank: string;
  wageType: string;
  amount: number;
};


type VesselId = "amakus-island" | "pacific-voyager" | "atlantic-star";

type VesselData = {
  [K in VesselId]: SalaryScaleData[];
};
const vesselData: VesselData = {
  "amakus-island": [
    {
      rank: "Captain",
      wageType: "Basic Wage",
      amount: 1075.0,
    },
    {
      rank: "Chief Officer",
      wageType: "Basic Wage",
      amount: 2715.0,
    },
    {
      rank: "Second Officer",
      wageType: "Basic Wage",
      amount: 1950.0,
    },
    {
      rank: "Third Officer",
      wageType: "Basic Wage",
      amount: 1750.0,
    },
    {
      rank: "Chief Engineer",
      wageType: "Basic Wage",
      amount: 1050.0,
    },
    {
      rank: "Engineering Officer",
      wageType: "Basic Wage",
      amount: 910.0,
    },
    {
      rank: "Electrical Officer",
      wageType: "Basic Wage",
      amount: 870.0,
    },
    {
      rank: "Deck Cadet",
      wageType: "Basic Wage",
      amount: 420.0,
    },
    {
      rank: "Engine Cadet",
      wageType: "Basic Wage",
      amount: 450.0,
    },
    {
      rank: "Boatswain",
      wageType: "Basic Wage",
      amount: 550.0,
    },
    {
      rank: "Able Seaman",
      wageType: "Basic Wage",
      amount: 400.0,
    },
    {
      rank: "Ordinary Seaman",
      wageType: "Basic Wage",
      amount: 350.0,
    },
    {
      rank: "Chief Cook",
      wageType: "Basic Wage",
      amount: 420.0,
    },

    // ... existing data ...
  ],
  "pacific-voyager": [
    {
      rank: "Captain",
      wageType: "Basic Wage",
      amount: 1125.0,
    },
    {
      rank: "Chief Officer",
      wageType: "Basic Wage",
      amount: 2815.0,
    },
    {
      rank: "Second Officer",
      wageType: "Basic Wage",
      amount: 2050.0,
    },
    {
      rank: "Third Officer",
      wageType: "Basic Wage",
      amount: 1850.0,
    },
    {
      rank: "Chief Engineer",
      wageType: "Basic Wage",
      amount: 1100.0,
    },
    {
      rank: "Engineering Officer",
      wageType: "Basic Wage",
      amount: 910.0,
    },
    {
      rank: "Electrical Officer",
      wageType: "Basic Wage",
      amount: 870.0,
    },
    {
      rank: "Deck Cadet",
      wageType: "Basic Wage",
      amount: 420.0,
    },
    {
      rank: "Engine Cadet",
      wageType: "Basic Wage",
      amount: 450.0,
    },
    {
      rank: "Boatswain",
      wageType: "Basic Wage",
      amount: 550.0,
    },
    {
      rank: "Able Seaman",
      wageType: "Basic Wage",
      amount: 400.0,
    },
    {
      rank: "Ordinary Seaman",
      wageType: "Basic Wage",
      amount: 350.0,
    },
    {
      rank: "Chief Cook",
      wageType: "Basic Wage",
      amount: 420.0,
    },
  ],
  "atlantic-star": [
    {
      rank: "Captain",
      wageType: "Basic Wage",
      amount: 1150.0,
    },
    {
      rank: "Chief Officer",
      wageType: "Basic Wage",
      amount: 2915.0,
    },
    {
      rank: "Second Officer",
      wageType: "Basic Wage",
      amount: 2150.0,
    },
    {
      rank: "Third Officer",
      wageType: "Basic Wage",
      amount: 1950.0,
    },
    {
      rank: "Chief Engineer",
      wageType: "Basic Wage",
      amount: 1100.0,
    },
    {
      rank: "Engineering Officer",
      wageType: "Basic Wage",
      amount: 910.0,
    },
    {
      rank: "Electrical Officer",
      wageType: "Basic Wage",
      amount: 870.0,
    },
    {
      rank: "Deck Cadet",
      wageType: "Basic Wage",
      amount: 420.0,
    },
    {
      rank: "Engine Cadet",
      wageType: "Basic Wage",
      amount: 450.0,
    },
    {
      rank: "Boatswain",
      wageType: "Basic Wage",
      amount: 550.0,
    },
    {
      rank: "Able Seaman",
      wageType: "Basic Wage",
      amount: 400.0,
    },
    {
      rank: "Ordinary Seaman",
      wageType: "Basic Wage",
      amount: 350.0,
    },
    {
      rank: "Chief Cook",
      wageType: "Basic Wage",
      amount: 420.0,
    },
  ],
};

type WageDescriptionData = {
  wageCode: string;
  wageName: string;
  payableOnBoard: boolean;
};

type ForexData = {
  year: number;
  month: string;
  exchangeRate: number;
};

// Add the forexData back
const forexData = [
  {
    year: 2024,
    month: "January",
    exchangeRate: 56.2,
  },
  {
    year: 2024,
    month: "February",
    exchangeRate: 56.9,
  },
  {
    year: 2024,
    month: "March",
    exchangeRate: 57.3,
  },
  {
    year: 2024,
    month: "April",
    exchangeRate: 57.5,
  },
  {
    year: 2024,
    month: "May",
    exchangeRate: 57.7,
  },
  {
    year: 2024,
    month: "June",
    exchangeRate: 57.9,
  },
  {
    year: 2024,
    month: "July",
    exchangeRate: 58.1,
  },
  {
    year: 2024,
    month: "August",
    exchangeRate: 58.3,
  },
  {
    year: 2024,
    month: "September",
    exchangeRate: 58.5,
  },
  {
    year: 2024,
    month: "October",
    exchangeRate: 58.7,
  },
  {
    year: 2024,
    month: "November",
    exchangeRate: 58.9,
  },
  {
    year: 2024,
    month: "December",
    exchangeRate: 59.1,
  },
];

export default function Wages() {
  const [activeTab, setActiveTab] = useState("salary");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVesselTypeId, setSelectedVesselTypeId] = useState<number | null>(null);
  const [vesselTypes, setVesselTypes] = useState<VesselType[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({
    RankID: true,
    WageID: true,
    Rank: true,
    WageAmount: true,
    action: true,
    Wage: true,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSalaryScale, setSelectedSalaryScale] =
    useState<SalaryScaleData | null>(null);
  const [editWageDescriptionDialogOpen, setEditWageDescriptionDialogOpen] =
    useState(false);
  const [selectedWageDescription, setSelectedWageDescription] =
    useState<WageDescriptionData | null>(null);
  const [editForexDialogOpen, setEditForexDialogOpen] = useState(false);
  const [selectedForex, setSelectedForex] = useState<ForexData | null>(null);
  
  // New state for API data
  const [salaryScaleItems, setSalaryScaleItems] = useState<SalaryScaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for wage description API data
  const [wageDescriptionItems, setWageDescriptionItems] = useState<WageDescriptionItem[]>([]);
  const [isLoadingWageDescription, setIsLoadingWageDescription] = useState(false);
  const [wageDescriptionError, setWageDescriptionError] = useState<string | null>(null);

  // Fetch salary scale data
  useEffect(() => {
    async function fetchSalaryScale() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getSalaryScaleList();
        if (response.success) {
          setSalaryScaleItems(response.data);
          
          // Extract unique vessel types from the data
          const uniqueVesselTypes = Array.from(
            new Set(response.data.map(item => JSON.stringify({ 
              id: item.VesselTypeId, 
              name: item.VesselTypeName 
            })))
          )
          .map(str => JSON.parse(str) as VesselType)
          .filter(item => item.id !== undefined && item.name !== undefined);
          
          setVesselTypes(uniqueVesselTypes);
          
          // Set default selected vessel to the first one
          if (uniqueVesselTypes.length > 0 && selectedVesselTypeId === null) {
            setSelectedVesselTypeId(uniqueVesselTypes[0].id);
          }
        } else {
          setError(response.message || "Failed to fetch salary scale data");
        }
      } catch (err) {
        setError("An error occurred while fetching salary scale data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalaryScale();
  }, []);

  // Fetch wage description data
  useEffect(() => {
    async function fetchWageDescription() {
      setIsLoadingWageDescription(true);
      setWageDescriptionError(null);
      try {
        const response = await getWageDescriptionList();
        if (response.success) {
          setWageDescriptionItems(response.data);
        } else {
          setWageDescriptionError(response.message || "Failed to fetch wage description data");
        }
      } catch (err) {
        setWageDescriptionError("An error occurred while fetching wage description data");
        console.error(err);
      } finally {
        setIsLoadingWageDescription(false);
      }
    }

    fetchWageDescription();
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const salaryScaleColumns: ColumnDef<SalaryScaleItem>[] = [
    {
      id: "Rank",
      accessorKey: "Rank",
      header: ({ column }) => <div className="text-left">Rank ID</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("Rank")}</div>
      ),
    },
    {
      id: "WageID",
      accessorKey: "WageID",
      header: ({ column }) => <div className="text-center">Wage ID</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.Wage || row.getValue("WageID")}</div>
      ),
    },
    {
      id: "WageAmount",
      accessorKey: "WageAmount",
      header: ({ column }) => <div className="text-center">Amount</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("WageAmount")}</div>
      ),
    },
    {
      id: "action",
      header: ({ column }) => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const salaryScale = row.original;
        // Function that displays SweetAlert2 confirmation when deleting a crew member
        const handleDelete = (rankId: number) => {
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
              text: "Are you sure you want to delete this salary scale? This action cannot be undone.",
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
                  text: "The salary scale has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your salary scale is safe :)",
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
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    // Convert SalaryScaleItem to SalaryScaleData for the dialog
                    const dialogData: SalaryScaleData = {
                      rank: salaryScale.RankID.toString(),
                      wageType: salaryScale.WageID.toString(),
                      amount: salaryScale.WageAmount,
                    };
                    setSelectedSalaryScale(dialogData);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Salary Scale
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(salaryScale.RankID)}
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

  const wageDescriptionColumns: ColumnDef<WageDescriptionItem>[] = [
    {
      id: "WageCode",
      accessorKey: "WageCode",
      header: ({ column }) => <div className="text-left">Wage Code</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("WageCode")}</div>
      ),
    },
    {
      id: "WageName",
      accessorKey: "WageName",
      header: ({ column }) => <div className="text-center">Wage Name</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("WageName")}</div>
      ),
    },
    {
      id: "PayableOnBoard",
      accessorKey: "PayableOnBoard",
      header: ({ column }) => (
        <div className="text-center">Payable On Board</div>
      ),
      cell: ({ row }) => {
        const value = Boolean(row.getValue("PayableOnBoard"));
        return (
          <div className="text-center">
            <div
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 py-1 text-sm font-medium",
                value
                  ? "bg-[#DCE8F2] text-[#1D1972]"
                  : "bg-[#E1D5D5] text-[#734545]"
              )}
            >
              {value ? "Yes" : "No"}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const wageDescription = row.original;
        // Function that displays SweetAlert2 confirmation when deleting a crew member
        const handleDelete = (wageCode: string) => {
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
              text: "Are you sure you want to delete this wage type? This action cannot be undone.",
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
                  text: "The wage type has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your wage type is safe :)",
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
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    // Convert API data to the format expected by the dialog
                    const dialogData: WageDescriptionData = {
                      wageCode: wageDescription.WageCode,
                      wageName: wageDescription.WageName,
                      payableOnBoard: Boolean(wageDescription.PayableOnBoard),
                    };
                    setSelectedWageDescription(dialogData);
                    setEditWageDescriptionDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Wage
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(wageDescription.WageCode)}
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

  const forexColumns: ColumnDef<ForexData>[] = [
    {
      id: "year",
      accessorKey: "year",
      header: ({ column }) => <div className="text-justify">Year</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("year")}</div>
      ),
    },
    {
      id: "month",
      accessorKey: "month",
      header: ({ column }) => <div className="text-center">Month</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("month")}</div>
      ),
    },
    {
      id: "exchangeRate",
      accessorKey: "exchangeRate",
      header: ({ column }) => <div className="text-center">Exchange Rate</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("exchangeRate")}</div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const forex = row.original;
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
              text: "Are you sure you want to delete this forex? This action cannot be undone.",
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
                  text: "The forex has been successfully deleted.",
                  icon: "success",
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                  title: "Cancelled",
                  text: "Your forex is safe :)",
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
                  <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedForex(forex);
                    setEditForexDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Forex
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() => handleDelete(forex.year.toString())}
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

  // Filter wage description data based on search term
  const filteredWageDescription = wageDescriptionItems.filter((item) => {
    if (!searchTerm) return true;
    
    return (
      item.WageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.WageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Filter forex data based on search term
  const filteredForex = forexData.filter((forex) => {
    if (!searchTerm) return true;
    
    return (
      forex.year.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      forex.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forex.exchangeRate.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Filter salary scale data based on search term and vessel type
  const filteredSalaryScale = salaryScaleItems.filter((item) => {
    // First filter by selected vessel type
    if (selectedVesselTypeId !== null && item.VesselTypeId !== selectedVesselTypeId) {
      return false;
    }
    
    // Then filter by search term
    if (!searchTerm) return true;
    
    return (
      (item.RankID && item.RankID.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.WageID && item.WageID.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.WageAmount && item.WageAmount.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Rank && item.Rank.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Wage && item.Wage.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const visibleColumns = salaryScaleColumns.filter(
    (column) => columnVisibility[column.id as string]
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
              <h1 className="text-3xl font-semibold mb-0">Wages</h1>
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
                        value="salary"
                        className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Salary Scale
                      </TabsTrigger>
                      <TabsTrigger
                        value="wage-description"
                        className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Wage Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="forex"
                        className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                      >
                        Forex
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
                  value="salary"
                  className="p-2 mt-0 overflow-y-auto flex-1"
                >
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                        <Input
                          placeholder="Search salary scale by Rank ID, Wage ID, or amount..."
                          className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <Select
                          value={selectedVesselTypeId !== null ? selectedVesselTypeId.toString() : ""}
                          onValueChange={(value) => setSelectedVesselTypeId(Number(value))}
                        >
                          <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[300px] sm:min-w-[320px] w-full sm:w-auto">
                            <div className="flex items-center justify-between w-full -mx-4">
                              <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                                <span className="text-muted-foreground text-base">
                                  Select Vessel Type
                                </span>
                              </div>
                              <span className="text-foreground text-base px-4">
                                {selectedVesselTypeId !== null 
                                  ? vesselTypes.find(v => v.id === selectedVesselTypeId)?.name || "Unknown"
                                  : "Select..."}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {vesselTypes.length > 0 ? vesselTypes.map((vessel) => (
                              <SelectItem key={vessel.id} value={vessel.id.toString()}>
                                {vessel.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="0">No vessel types available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[130px] sm:min-w-[140px] w-full sm:w-auto bg-[#FFFFFF]"
                            >
                              Columns
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[150px] bg-[#FFFFFF]"
                          >
                            {salaryScaleColumns.map((column) => {
                              const columnId = column.id;
                              if (!columnId) return null;
                              return (
                                <DropdownMenuItem
                                  key={columnId}
                                  className="capitalize"
                                  onClick={() =>
                                    toggleColumnVisibility(columnId)
                                  }
                                >
                                  <div className="flex items-center w-full">
                                    <span className="text-primary w-4 mr-2">
                                      {columnVisibility[columnId] ? "✓" : ""}
                                    </span>
                                    <span>{columnId}</span>
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Loading and error states */}
                    {isLoading && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">Loading salary scale data...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">{error}</p>
                      </div>
                    )}
                    
                    {/* DataTable with custom styling */}
                    {!isLoading && !error && (
                      <div className="bg-[#F9F9F9] rounded-md border mb-3">
                        <DataTable
                          columns={visibleColumns}
                          data={filteredSalaryScale}
                          pageSize={7}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="wage-description"
                  className="p-2 mt-0 overflow-y-auto flex-1"
                >
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                        <Input
                          placeholder="Search by wage code or name..."
                          className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <Button className="bg-primary text-white hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                        <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        Add Wage Type
                      </Button>
                    </div>
                    
                    {/* Loading and error states */}
                    {isLoadingWageDescription && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">Loading wage description data...</p>
                      </div>
                    )}
                    
                    {wageDescriptionError && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">{wageDescriptionError}</p>
                      </div>
                    )}
                    
                    {/* DataTable with custom styling */}
                    {!isLoadingWageDescription && !wageDescriptionError && (
                      <div className="bg-[#F9F9F9] rounded-md border mb-3">
                        <DataTable
                          columns={wageDescriptionColumns}
                          data={filteredWageDescription}
                          pageSize={7}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="forex"
                  className="p-2 mt-0 overflow-y-auto flex-1"
                >
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                        <Input
                          placeholder="Search crew by wage code, wage name..."
                          className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* DataTable with custom styling */}
                    <div className="bg-[#F9F9F9] rounded-md border mb-3">
                      <DataTable
                        columns={forexColumns}
                        data={filteredForex}
                        pageSize={7}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      {selectedSalaryScale && (
        <EditSalaryScaleDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          salaryScale={selectedSalaryScale}
        />
      )}
      {selectedWageDescription && (
        <EditWageDescriptionDialog
          open={editWageDescriptionDialogOpen}
          onOpenChange={setEditWageDescriptionDialogOpen}
          wageDescription={selectedWageDescription}
        />
      )}
      {selectedForex && (
        <EditForexDialog
          open={editForexDialogOpen}
          onOpenChange={setEditForexDialogOpen}
          forex={selectedForex}
        />
      )}
    </>
  );
}
