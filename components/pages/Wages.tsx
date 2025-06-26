"use client";

import { useState, useEffect } from "react";
// Link import removed as it's not used directly in this component snippet
// import Link from "next/link";
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
  // DropdownMenuLabel, // Not used
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash,
  // Filter, // Not used
  // IdCard, // Not used
  // FolderClock, // Not used
  // Users, // Not used
  Pencil,
  ChevronDown,
} from "lucide-react";
// import { Badge } from "@/components/ui/badge"; // Not used
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EditSalaryScaleDialog,
  DialogSelectOption,
} from "@/components/dialogs/EditSalaryScaleDialog"; // Added DialogSelectOption
import { EditWageDescriptionDialog } from "@/components/dialogs/EditWageDescriptionDialog";
import { EditForexDialog } from "@/components/dialogs/EditForexDialog";
import { AddWageDescriptionDialog } from "@/components/dialogs/AddWageDescriptionDialog";
import Swal from "sweetalert2";
import {
  SalaryScaleItem, // Ensure this is imported
  getSalaryScaleList,
  // updateSalaryScale and its payload are used in the dialog, not directly here
} from "../../src/services/wages/salaryScale.api"; // Ensure path is correct
import {
  WageDescriptionItem,
  deleteWageDescription,
  getWageDescriptionList,
} from "../../src/services/wages/wageDescription.api";
import {
  deleteWageForex,
  getWageForexList,
} from "@/src/services/wages/wageForex.api";

// Type for data passed to dialog was previously SalaryScaleData, now managed by selectedSalaryScale (SalaryScaleItem)
// type SalaryScaleData = {
//   rank: string;
//   wageType: string;
//   amount: number;
//   vesselTypeId?: number;
// };

type WageDescriptionData = {
  wageId: number;
  wageCode: string;
  wageName: string;
  payableOnboard: boolean;
};

type ForexData = {
  id: number;
  year: number;
  month: number;
  exchangeRate: number;
};

export default function Wages() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("salary");
  const [searchTerm, setSearchTerm] = useState("");
  const [onSuccess, setOnSuccess] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({
    Rank: true,
    Wage: true,
    WageAmount: true,
    VesselTypeName: true,
    action: true,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editWageDescriptionDialogOpen, setEditWageDescriptionDialogOpen] =
    useState(false);
  const [editForexDialogOpen, setEditForexDialogOpen] = useState(false);
  const [AddWageDescriptionDialogOpen, setAddWageDescriptionDialogOpen] =
    useState(false);
  const [forexData, setForexData] = useState<ForexData[]>([]);
  const [selectedForex, setSelectedForex] = useState<ForexData | null>(null);

  const [selectedSalaryScale, setSelectedSalaryScale] =
    useState<SalaryScaleItem | null>(null); // Changed type
  const [salaryScaleItems, setSalaryScaleItems] = useState<SalaryScaleItem[]>(
    []
  );
  const [filteredSalaryScale, setFilteredSalaryScale] = useState<
    SalaryScaleItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uniqueVesselTypes, setUniqueVesselTypes] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedVesselTypeId, setSelectedVesselTypeId] =
    useState<string>("all");

  // State for lists to pass to EditSalaryScaleDialog
  const [uniqueRanksForDialog, setUniqueRanksForDialog] = useState<
    DialogSelectOption[]
  >([]);
  const [uniqueWageTypesForDialog, setUniqueWageTypesForDialog] = useState<
    DialogSelectOption[]
  >([]);

  const [selectedWageDescription, setSelectedWageDescription] =
    useState<WageDescriptionData | null>(null);
  const [wageDescriptionItems, setWageDescriptionItems] = useState<
    WageDescriptionItem[]
  >([]);
  const [isLoadingWageDescription, setIsLoadingWageDescription] =
    useState(false);
  const [wageDescriptionError, setWageDescriptionError] = useState<
    string | null
  >(null);
  const [onSuccessAdd, setOnSuccessAdd] = useState(false);

  const fetchSalaryScaleData = async () => {
    // Renamed function for clarity
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSalaryScaleList();
      if (response.success) {
        setSalaryScaleItems(response.data);
      } else {
        setError(response.message || "Failed to fetch salary scale data");
      }
    } catch (err) {
      setError("An error occurred while fetching salary scale data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryScaleData();
  }, []);

  useEffect(() => {
    if (salaryScaleItems.length > 0) {
      const vesselTypeMap = new Map<number, string>();
      salaryScaleItems.forEach((item) => {
        if (
          item.VesselTypeId !== null &&
          item.VesselTypeId !== undefined &&
          item.VesselTypeName
        ) {
          vesselTypeMap.set(item.VesselTypeId, item.VesselTypeName);
        }
      });
      setUniqueVesselTypes(
        Array.from(vesselTypeMap, ([id, name]) => ({ id, name })).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      // Populate unique ranks for dialog
      const rankMap = new Map<number, string>();
      salaryScaleItems.forEach((item) => rankMap.set(item.RankID, item.Rank));
      setUniqueRanksForDialog(
        Array.from(rankMap, ([id, name]) => ({ id, name })).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      // Populate unique wage types for dialog
      const wageTypeMap = new Map<number, string>();
      salaryScaleItems.forEach((item) =>
        wageTypeMap.set(item.WageID, item.Wage)
      );
      setUniqueWageTypesForDialog(
        Array.from(wageTypeMap, ([id, name]) => ({ id, name })).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }
  }, [salaryScaleItems]);

  useEffect(() => {
    const filtered = salaryScaleItems.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearchTerm =
        !searchTermLower ||
        item.Rank.toLowerCase().includes(searchTermLower) ||
        item.Wage.toLowerCase().includes(searchTermLower) ||
        item.WageAmount.toString().includes(searchTermLower) || // Amount search might not need toLowerCase
        (item.VesselTypeName &&
          item.VesselTypeName.toLowerCase().includes(searchTermLower));

      const matchesVesselType =
        selectedVesselTypeId === "all" ||
        (item.VesselTypeId !== null &&
          item.VesselTypeId !== undefined &&
          item.VesselTypeId.toString() === selectedVesselTypeId);

      return matchesSearchTerm && matchesVesselType;
    });
    setFilteredSalaryScale(filtered);
  }, [searchTerm, salaryScaleItems, selectedVesselTypeId]);

  useEffect(() => {
    async function fetchWageDescription() {
      setIsLoadingWageDescription(true);
      setWageDescriptionError(null);
      try {
        const response = await getWageDescriptionList();
        if (response.success) {
          setWageDescriptionItems(response.data);
        } else {
          setWageDescriptionError(
            response.message || "Failed to fetch wage description data"
          );
        }
      } catch (err) {
        setWageDescriptionError(
          "An error occurred while fetching wage description data"
        );
        console.error(err);
      } finally {
        setIsLoadingWageDescription(false);
      }
    }
    fetchWageDescription();

    if (onSuccessAdd) {
      fetchWageDescription();
      setOnSuccessAdd(false);
    }
  }, [onSuccessAdd]);

  useEffect(() => {
    const fetchWageForex = async () => {
      getWageForexList()
        .then((res) => {
          if (res.success) {
            const mapped: ForexData[] = res.data.map((item) => ({
              id: item.ExchangeRateID,
              year: item.ExchangeRateYear,
              month: item.ExchangeRateMonth,
              exchangeRate: item.ExchangeRate,
            }));
            setForexData(mapped);
          } else {
            console.error("Failed to fetch forex data:", res.message);
          }
        })
        .catch((err) => console.error("Error fetching forex data:", err));
    };
    fetchWageForex();

    if (onSuccess) {
      fetchWageForex();
      setOnSuccess(false);
    }
  }, [onSuccess]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
    setSelectedVesselTypeId("all");
  };

  // Callback for successful salary scale update
  const handleSalaryScaleUpdateSuccess = (updatedItem: SalaryScaleItem) => {
    setSalaryScaleItems((prevItems) =>
      prevItems.map((item) =>
        item.SalaryScaleDetailID === updatedItem.SalaryScaleDetailID
          ? updatedItem
          : item
      )
    );
    setEditDialogOpen(false); // Close dialog handled by dialog itself via onOpenChange
    // Swal success message is shown in the dialog itself.
    // Optionally, refetch if there are complex side effects not covered by updating the single item:
    // fetchSalaryScaleData();
  };

  const salaryScaleColumns: ColumnDef<SalaryScaleItem>[] = [
    {
      id: "Rank",
      accessorKey: "Rank",
      header: () => <div className="text-left">Rank</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("Rank")}</div>
      ),
    },
    {
      id: "Wage",
      accessorKey: "Wage",
      header: () => <div className="text-center">Wage Type</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.Wage || `ID: ${row.original.WageID}`}
        </div>
      ),
    },
    {
      id: "WageAmount",
      accessorKey: "WageAmount",
      header: () => <div className="text-center">Amount</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("WageAmount")}</div>
      ),
    },
    {
      id: "VesselTypeName",
      accessorKey: "VesselTypeName",
      header: () => <div className="text-center">Vessel Type</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("VesselTypeName") || "N/A"}
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const salaryScaleItem = row.original; // Renamed for clarity
        const handleDelete = (detailId: number) => {
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
              text: `Delete ${salaryScaleItem.Rank} - ${salaryScaleItem.Wage}? This cannot be undone.`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
              cancelButtonText: "No, cancel!",
              reverseButtons: true,
            })
            .then((result) => {
              if (result.isConfirmed) {
                // TODO: Implement actual delete API call
                console.log("Deleting salary scale detail ID:", detailId);
                // Example: deleteSalaryScale(detailId).then(() => {
                //   swalWithBootstrapButtons.fire("Deleted!", "Item deleted.", "success");
                //   fetchSalaryScaleData(); // Refresh list
                // }).catch(err => swalWithBootstrapButtons.fire("Error", "Could not delete.", "error"));
                swalWithBootstrapButtons.fire(
                  "Simulated Delete!",
                  "Item would be deleted.",
                  "success"
                );
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                  "Cancelled",
                  "Item is safe.",
                  "error"
                );
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
                    setSelectedSalaryScale(salaryScaleItem); // Set the full item
                    setEditDialogOpen(true);
                  }}>
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Salary Scale
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() =>
                    handleDelete(salaryScaleItem.SalaryScaleDetailID)
                  }>
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
      header: () => <div className="text-left">Wage Code</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("WageCode")}</div>
      ),
    },
    {
      id: "WageName",
      accessorKey: "WageName",
      header: () => <div className="text-center">Wage Name</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("WageName")}</div>
      ),
    },
    {
      id: "PayableOnboard",
      accessorKey: "PayableOnboard",
      header: () => <div className="text-center">Payable On Board</div>,
      cell: ({ row }) => {
        // console.log("row.original in PayableOnBoard cell:", row.original);
        const rawValue = row.original?.PayableOnboard; // console.log(
        //   "PayableOnBoard Raw Value (row.original):",
        //   rawValue,
        //   typeof rawValue
        // );
        const value = rawValue === 1;
        return (
          <div className="text-center">
            <div
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 py-1 text-sm font-medium",
                value
                  ? "bg-[#DCE8F2] text-[#1D1972]"
                  : "bg-[#E1D5D5] text-[#734545]"
              )}>
              {value ? "Yes" : "No"}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions_wagedesc", // Ensure unique ID if "actions" is used elsewhere
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const wageDescription = row.original;
        const handleDelete = (wageCode: string) => {
          Swal.fire({
            title: "Are you sure?",
            text: "Delete this wage type?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
          })
            .then((result) => {
              console.log("Wage Code in handle Delete: " + wageCode);
              if (result.isConfirmed) {
                deleteWageDescription(wageDescription.WageID).then(
                  (response) => {
                    if (response.success) {
                      Swal.fire("Deleted!", "Wage type deleted.", "success");
                      setOnSuccessAdd(true);
                    } else {
                      Swal.fire(
                        "Error!",
                        response.message || "Failed to delete wage type.",
                        "error"
                      );
                    }
                  }
                );
              }
            })
            .catch((err) => {
              Swal.fire(
                "Error!",
                err.message || "Failed to delete wage type.",
                "error"
              );
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedWageDescription({
                      wageId: wageDescription.WageID,
                      wageCode: wageDescription.WageCode,
                      wageName: wageDescription.WageName,
                      payableOnboard: Boolean(wageDescription.PayableOnboard),
                    });
                    setEditWageDescriptionDialogOpen(true);
                  }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Wage
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(wageDescription.WageCode)}
                  className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete Wage
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
      header: () => <div className="text-justify">Year</div>,
      cell: ({ row }) => (
        <div className="text-justify">{row.getValue("year")}</div>
      ),
    },
    {
      id: "month",
      accessorKey: "month",
      header: () => <div className="text-center">Month</div>,
      cell: ({ row }) => {
        const monthNum = row.getValue("month") as number;
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return (
          <div className="text-center">
            {monthNames[monthNum - 1] || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "exchangeRate",
      accessorKey: "exchangeRate",
      header: () => <div className="text-center">Exchange Rate</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("exchangeRate")}</div>
      ),
    },
    {
      id: "actions_forex", // Ensure unique ID
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const forex = row.original;
        const handleDelete = (id: number) => {
          Swal.fire({
            title: "Are you sure?",
            text: "Delete this forex entry?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
          }).then(async (result) => {
            console.log("ID in handle Delete: " + id);
            if (result.isConfirmed) {
              await deleteWageForex(id)
                .then((response) => {
                  if (response.success) {
                    Swal.fire("Deleted!", "Forex entry deleted.", "success");
                    setOnSuccess(true); // Trigger re-fetch
                  } else {
                    Swal.fire(
                      "Error!",
                      response.message || "Failed to delete forex entry.",
                      "error"
                    );
                  }
                })
                .catch((error) => {
                  Swal.fire(
                    "Error!",
                    error.message || "Failed to delete forex entry.",
                    "error"
                  );
                });
              Swal.fire("Deleted!", "Forex entry deleted.", "success");
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedForex(forex);
                    setEditForexDialogOpen(true);
                  }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Forex
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(forex.id)}
                  className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete Forex
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const filteredWageDescription = wageDescriptionItems.filter((item) => {
    if (activeTab !== "wage-description" || !searchTerm) return true;
    return (
      item.WageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.WageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredForex = forexData
    .filter(
      (forex) =>
        (yearFilter === "all" || forex.year.toString() === yearFilter) &&
        (monthFilter === "all" || forex.month.toString() === monthFilter)
    )
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const getUniqueYears = () =>
    Array.from(new Set(forexData.map((item) => item.year))).sort(
      (a, b) => b - a
    );
  const getMonthName = (monthNum: number) =>
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][monthNum - 1] || "Unknown";

  const toggleColumnVisibility = (columnId: string) =>
    setColumnVisibility((prev) => ({ ...prev, [columnId]: !prev[columnId] }));

  const visibleColumns = salaryScaleColumns.filter(
    (col) => col.id && columnVisibility[col.id] !== false
  );

  return (
    <>
      <div className="h-full w-full p-3 pt-3 overflow-hidden">
        {/* Styles remain the same */}
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
        <div className="h-full overflow-hidden">
          <div className="p-3 pt-0 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold mb-0">Wages</h1>
            </div>
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full flex flex-col h-full">
                <div className="border-b">
                  <div className="px-4 pt-1">
                    <TabsList className="bg-transparent p-0 h-8 w-full flex justify-start space-x-8">
                      {["salary", "wage-description", "forex"].map((tabValue) => {
                        const label =
                          tabValue === "salary"
                            ? "Salary Scale"
                            : tabValue
                                .split("-")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ");

                        return (
                          <TabsTrigger
                            key={tabValue}
                            value={tabValue}
                            className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                          >
                            {label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </div>

                <TabsContent
                  value="salary"
                  className="p-2 mt-0 overflow-y-auto flex-1">
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                        <Input
                          placeholder="Search by Rank, Wage, Amount, Vessel Type..."
                          className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <Select
                          value={selectedVesselTypeId}
                          onValueChange={setSelectedVesselTypeId}>
                          <SelectTrigger className="bg-white h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[280px] w-full sm:w-auto">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md -ml-3 sm:-ml-4">
                                <span className="text-gray-700 font-medium whitespace-nowrap">
                                  Select Vessel
                                </span>
                              </div>
                              <div className="flex-grow text-left px-2 truncate">
                                <SelectValue
                                  placeholder="All Types"
                                  className="text-foreground text-sm sm:text-base"
                                />
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Vessel Types
                            </SelectItem>
                            {uniqueVesselTypes.map((vType) => (
                              <SelectItem
                                key={vType.id}
                                value={vType.id.toString()}>
                                {vType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[130px] sm:min-w-[140px] w-full sm:w-auto bg-[#FFFFFF]">
                              Columns <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px] bg-[#FFFFFF]">
                            {salaryScaleColumns.map((col) => {
                              if (!col.id) return null;
                              let dName = col.id;
                              if (col.id === "Rank") dName = "Rank";
                              else if (col.id === "Wage") dName = "Wage Type";
                              else if (col.id === "WageAmount")
                                dName = "Amount";
                              else if (col.id === "VesselTypeName")
                                dName = "Vessel Type";
                              else if (col.id === "action") dName = "Action";
                              return (
                                <DropdownMenuItem
                                  key={col.id}
                                  onClick={() =>
                                    col.id && toggleColumnVisibility(col.id)
                                  }>
                                  <div className="flex items-center w-full">
                                    <span className="text-primary w-4 mr-2">
                                      {columnVisibility[col.id] !== false
                                        ? "✓"
                                        : ""}
                                    </span>
                                    <span>{dName}</span>
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">
                          Loading salary scale data...
                        </p>
                      </div>
                    )}
                    {error && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">{error}</p>
                      </div>
                    )}
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
                {/* Other TabsContent (wage-description, forex) remain largely the same, ensure search term handling is correct for each tab */}
                <TabsContent
                  value="wage-description"
                  className="p-2 mt-0 overflow-y-auto flex-1">
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                        <Input
                          placeholder="Search by wage code or name..."
                          className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                          value={
                            activeTab === "wage-description" ? searchTerm : ""
                          }
                          onChange={(e) =>
                            activeTab === "wage-description" &&
                            setSearchTerm(e.target.value)
                          }
                        />
                      </div>
                      <Button
                        className="bg-primary text-white hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                        onClick={() => setAddWageDescriptionDialogOpen(true)}>
                        <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        Add Wage Type
                      </Button>
                    </div>
                    {isLoadingWageDescription && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">
                          Loading wage description data...
                        </p>
                      </div>
                    )}
                    {wageDescriptionError && (
                      <div className="flex justify-center items-center h-40">
                        <p className="text-red-500">{wageDescriptionError}</p>
                      </div>
                    )}
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
                  className="p-2 mt-0 overflow-y-auto flex-1">
                  <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 w-full">
                      <div className="w-full md:w-1/2 pr-0 md:pr-2">
                        <Select
                          value={monthFilter}
                          onValueChange={setMonthFilter}>
                          <SelectTrigger className="h-16 w-full bg-white border rounded-md p-0 overflow-hidden">
                            <div className="flex items-center justify-between w-full h-full">
                              <div className="flex items-center justify-center h-full bg-[#F6F6F6] py-2.5 border-r w-[45%]">
                                <span className="text-muted-foreground text-base">
                                  Select Month
                                </span>
                              </div>
                              <div className="w-[55%] px-4 flex items-center">
                                <SelectValue
                                  placeholder="Select Month"
                                  className="text-base"
                                />
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {[...Array(12)].map((_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}>
                                {getMonthName(i + 1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full md:w-1/2 pl-0 md:pl-2">
                        <Select
                          value={yearFilter}
                          onValueChange={setYearFilter}>
                          <SelectTrigger className="h-16 w-full bg-white border rounded-md p-0 overflow-hidden">
                            <div className="flex items-center justify-between w-full h-full">
                              <div className="flex items-center justify-center h-full bg-[#F6F6F6] py-2.5 border-r w-[45%]">
                                <span className="text-muted-foreground text-base">
                                  Select Year
                                </span>
                              </div>
                              <div className="w-[55%] px-4 flex items-center">
                                <SelectValue
                                  placeholder="Select Year"
                                  className="text-base"
                                />
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {getUniqueYears().map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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

      {selectedSalaryScale &&
        editDialogOpen && ( // Ensure dialog only renders when data is available and it's meant to be open
          <EditSalaryScaleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            salaryScale={selectedSalaryScale}
            ranks={uniqueRanksForDialog}
            wageTypes={uniqueWageTypesForDialog}
            onUpdateSuccess={handleSalaryScaleUpdateSuccess}
          />
        )}
      {selectedWageDescription && editWageDescriptionDialogOpen && (
        <EditWageDescriptionDialog
          open={editWageDescriptionDialogOpen}
          onOpenChange={setEditWageDescriptionDialogOpen}
          wageDescription={selectedWageDescription}
          onUpdateSuccess={(updatedItem) => {
            setWageDescriptionItems((prev) =>
              prev.map((item) =>
                item.WageID === updatedItem.WageID ? updatedItem : item
              )
            );
            setEditWageDescriptionDialogOpen(false);
          }}
        />
      )}
      {selectedForex && editForexDialogOpen && (
        <EditForexDialog
          open={editForexDialogOpen}
          onOpenChange={setEditForexDialogOpen}
          forex={selectedForex}
          setOnSuccess={setOnSuccess}
        />
      )}
      <AddWageDescriptionDialog
        setOnSuccessAdd={setOnSuccessAdd}
        open={AddWageDescriptionDialogOpen}
        onOpenChange={setAddWageDescriptionDialogOpen}
        // onSuccess={(newWageDescription) => {
        //   setWageDescriptionItems((prev) => [...prev, newWageDescription]);
        //   // Optionally refetch wage descriptions or rely on local update if AddWageDescriptionDialog returns full item
        // }}
      />
    </>
  );
}
