"use client";

import { AddForexDialog } from "../dialogs/AddForexDialog";
import { EditForexDialog } from "../dialogs/EditForexDialog";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { deleteWageForex, getWageForexList } from "@/src/services/wages/wageForex.api";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Plus, Search, Trash } from "lucide-react";
import { DataTable } from "../ui/data-table";
import { Input } from "../ui/input";

type ForexData = {
  id: number;
  year: number;
  month: number;
  exchangeRate: number;
};

export default function WagesForex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [forexData, setForexData] = useState<ForexData[]>([]);
  const [selectedForex, setSelectedForex] = useState<ForexData | null>(null);
  const [onSuccess, setOnSuccess] = useState(false);
  const [editForexDialogOpen, setEditForexDialogOpen] = useState(false);
  const [addForexDialogOpen, setAddForexDialogOpen] = useState(false);

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
      id: "actions_forex",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const forex = row.original;

        const now = new Date();
        const phTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );
        const currentYear = phTime.getFullYear();
        const currentMonth = phTime.getMonth() + 1; // 0-indexed

        const isPast =
          forex.year < currentYear ||
          (forex.year === currentYear && forex.month < currentMonth);

        const handleDelete = (id: number) => {
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
              text: `Delete Forex dated ${forex.year}, ${forex.month} with an exchange rate of ${forex.exchangeRate}? This action cannot be undone.`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
              cancelButtonText: "No, cancel!",
              reverseButtons: true,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const response = await deleteWageForex(id);
                  if (response.success) {
                    Swal.fire("Deleted!", "Forex entry deleted.", "success");
                    setOnSuccess(true);
                  } else {
                    Swal.fire(
                      "Error!",
                      response.message || "Failed to delete forex entry.",
                      "error"
                    );
                  }
                } catch (error: any) {
                  Swal.fire(
                    "Error!",
                    error.message || "Failed to delete forex entry.",
                    "error"
                  );
                }
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                  title: "Cancelled",
                  text: "Process cancelled.",
                  icon: "error",
                });
              }
            });
        };

        if (isPast) {
          return (
            <div className="text-center text-sm italic text-gray-400">N/A</div>
          );
        }

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
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Forex
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(forex.id)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete Forex
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full p-3 pt-3">
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
      <div className="h-full">
        <div className="p-3 pt-0 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Forex</h1>
          </div>
          <div className="flex flex-col space-y-4 sm:space-y-5 min-h-full">
            <div className="w-full space-y-4">
              <div className="flex w-full gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by wage code or name..."
                    className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* Add Button */}
                <Button
                  className="bg-primary text-white hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 shrink-0"
                  onClick={() => setAddForexDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Forex
                </Button>
              </div>
              <div className="flex gap-3 w-full">
                {/* Month */}
                <div className="w-1/2">
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="h-16 w-full bg-white border rounded-md p-0 overflow-hidden">
                      <div className="flex items-center w-full h-full">
                        <div className="flex items-center justify-center h-full bg-[#F6F6F6] border-r w-[45%]">
                          <span className="text-muted-foreground text-base">
                            Select Month
                          </span>
                        </div>
                        <div className="w-[55%] px-4 flex items-center">
                          <SelectValue placeholder="Select Month" className="text-base" />
                        </div>
                      </div>
                    </SelectTrigger>

                    <SelectContent className="h-80">
                      <SelectItem value="all">All Months</SelectItem>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="w-1/2">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="h-16 w-full bg-white border rounded-md p-0 overflow-hidden">
                      <div className="flex items-center w-full h-full">
                        <div className="flex items-center justify-center h-full bg-[#F6F6F6] border-r w-[45%]">
                          <span className="text-muted-foreground text-base">
                            Select Year
                          </span>
                        </div>
                        <div className="w-[55%] px-4 flex items-center">
                          <SelectValue placeholder="Select Year" className="text-base" />
                        </div>
                      </div>
                    </SelectTrigger>

                    <SelectContent className="h-80">
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
            </div>
            <div className="bg-[#F9F9F9] rounded-md border mb-3">
              <DataTable columns={forexColumns} data={filteredForex} pageSize={8} />
            </div>
          </div>
        </div>
      </div>

      <AddForexDialog
        open={addForexDialogOpen}
        onOpenChange={setAddForexDialogOpen}
        onSuccess={(newRate) => {
          const convertedRate: ForexData = {
            id: newRate.ExchangeRateID,
            year: newRate.ExchangeRateYear,
            month: newRate.ExchangeRateMonth,
            exchangeRate: newRate.ExchangeRate,
          };

          setForexData((prev) => {
            const updated = [...prev, convertedRate];
            return updated;
          });
        }}
      />

      {selectedForex && editForexDialogOpen && (
        <EditForexDialog
          open={editForexDialogOpen}
          onOpenChange={setEditForexDialogOpen}
          forex={selectedForex}
          setOnSuccess={setOnSuccess}
        />
      )}
    </div>
  );
}
