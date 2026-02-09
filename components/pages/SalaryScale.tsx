"use client";

import { Calendar, MoreHorizontal, Pencil, Search, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { getWageScale, SalaryScaleItem } from "@/src/services/wages/salaryScale.api";
import { DataTable } from "../ui/data-table";
import { DialogSelectOption, EditSalaryScaleDialog } from "../dialogs/EditSalaryScaleDialog";
import dayjs from "dayjs";

export default function SalaryScale() {
  const [searchTerm, setSearchTerm] = useState("");
  const [salaryScaleItems, setSalaryScaleItems] = useState<SalaryScaleItem[]>([]);
  const [selectedSalaryScale, setSelectedSalaryScale] = useState<SalaryScaleItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVesselTypeId, setSelectedVesselTypeId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredSalaryScale, setFilteredSalaryScale] = useState<SalaryScaleItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchSalaryScaleData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getWageScale();
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

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchSalaryScaleData();
  }, []);

  useEffect(() => {
    if (salaryScaleItems.length === 0) return;

    // Extract unique years from EffectivedateFrom
    const years = Array.from(
      new Set(
        salaryScaleItems
          .map(item =>
            item.EffectivedateFrom
              ? dayjs(item.EffectivedateFrom).year()
              : null
          )
          .filter((y): y is number => y !== null)
      )
    ).sort((a, b) => b - a); // latest first

    setAvailableYears(years);

    // Default to latest year
    if (years.length > 0 && selectedYear === "all") {
      setSelectedYear(years[0].toString());
    }
  }, [salaryScaleItems]);

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
      id: "EffectiveYear",
      header: () => <div className="text-center">Effective</div>,
      cell: ({ row }) => {
        const value = row.original.EffectivedateFrom;
        return (
          <div className="text-center font-medium">
            {value ? dayjs(value).year() : "N/A"}
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const salaryScaleItem = row.original;
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
                swalWithBootstrapButtons.fire(
                  "Simulated Delete!",
                  "Item would be deleted.",
                  "success"
                );
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                  title: "Cancelled",
                  text: "Process cancelled.",
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
                    setSelectedSalaryScale(salaryScaleItem); // Set the full item
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Salary Scale
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs sm:text-sm"
                  onClick={() =>
                    handleDelete(salaryScaleItem.SalaryScaleDetailID)
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

  useEffect(() => {
    const filtered = salaryScaleItems.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        item.Rank.toLowerCase().includes(search) ||
        item.Wage.toLowerCase().includes(search);

      // Year filter logic
      const itemYear = item.EffectivedateFrom
        ? dayjs(item.EffectivedateFrom).year().toString()
        : null;

      const matchesYear =
        selectedYear === "all" || itemYear === selectedYear;

      return matchesSearch && matchesYear;
    });

    setFilteredSalaryScale(filtered);
  }, [searchTerm, selectedYear, salaryScaleItems]);


  // Callback for successful salary scale update
  const handleSalaryScaleUpdateSuccess = (updatedItem: SalaryScaleItem) => {
    setSalaryScaleItems((prevItems) =>
      prevItems.map((item) =>
        item.SalaryScaleDetailID === updatedItem.SalaryScaleDetailID
          ? updatedItem
          : item
      )
    );
    setEditDialogOpen(false);
  };

  return (
    <div className="h-full w-full p-3 pt-3 overflow-hidden">
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
            <h1 className="text-3xl font-semibold mb-0">Salary Scale</h1>
          </div>
          <div className="flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
                {/* <Select
                  value={selectedVesselTypeId}
                  onValueChange={setSelectedVesselTypeId}
                >
                  <SelectTrigger className="bg-white h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[280px] w-full sm:w-auto">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border rounded-l-md -ml-3 sm:-ml-4">
                        <span className="text-gray-700 font-medium whitespace-nowrap">
                          Select Vessel Type
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
                    <SelectItem value="all">All Vessel Types</SelectItem>
                    {uniqueVesselTypes.map((vType) => (
                      <SelectItem key={vType.id} value={vType.id.toString()}>
                        {vType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-10 min-w-[160px] flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  columns={salaryScaleColumns}
                  data={filteredSalaryScale}
                  pageSize={10}
                />
              </div>
            )}
          </div>

          {/* {selectedSalaryScale && editDialogOpen && (
            <EditSalaryScaleDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              salaryScale={selectedSalaryScale}
              ranks={uniqueRanksForDialog}
              wageTypes={uniqueWageTypesForDialog}
              onUpdateSuccess={handleSalaryScaleUpdateSuccess}
            />
          )} */}
        </div>
      </div>
    </div>
  );
}