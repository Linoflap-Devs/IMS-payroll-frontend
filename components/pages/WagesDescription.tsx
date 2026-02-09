"use client";

import { MoreHorizontal, Pencil, Plus, Search, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { DataTable } from "../ui/data-table";
import {
  WageDescriptionItem,
  deleteWageDescription,
  getWageDescriptionList,
} from "../../src/services/wages/wageDescription.api";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditWageDescriptionDialog } from "../dialogs/EditWageDescriptionDialog";
import { AddWageDescriptionDialog } from "../dialogs/AddWageDescriptionDialog";

type WageDescriptionData = {
  wageId: number;
  wageCode: string;
  wageName: string;
  payableOnboard: boolean;
};

export default function WagesDescription() {
  const [searchTerm, setSearchTerm] = useState("");
  const [AddWageDescriptionDialogOpen, setAddWageDescriptionDialogOpen] = useState(false);
  const [isLoadingWageDescription, setIsLoadingWageDescription] = useState(false);
  const [wageDescriptionItems, setWageDescriptionItems] = useState<WageDescriptionItem[]>([]);
  const [wageDescriptionError, setWageDescriptionError] = useState<string | null>(null);
  const [onSuccessAdd, setOnSuccessAdd] = useState(false);
  const [editWageDescriptionDialogOpen, setEditWageDescriptionDialogOpen] = useState(false);
  const [selectedWageDescription, setSelectedWageDescription] = useState<WageDescriptionData | null>(null);
  const filteredWageDescription = wageDescriptionItems.filter((item) => {
    if (!searchTerm) return true;
    return (
      item.WageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.WageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        const rawValue = row.original?.PayableOnboard;
        const value = rawValue === 1;
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
      id: "actions_wagedesc",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const wageDescription = row.original;
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
              text: `Delete ${wageDescription.WageName}? This cannot be undone.`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
              cancelButtonText: "No, cancel!",
              reverseButtons: true,
            })
            .then((result) => {
              if (result.isConfirmed) {
                deleteWageDescription(wageDescription.WageID).then(
                  (response) => {
                    if (response.success) {
                      Swal.fire("Deleted!", "Wage type deleted.", "success");
                      setOnSuccessAdd(true);
                    } else {
                      Swal.fire({
                        title: "Error!",
                        text: response.message || "Failed to delete vessel.",
                        icon: "error",
                      });
                    }
                  }
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
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Wage
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(wageDescription.WageCode)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete Wage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
            <h1 className="text-3xl font-semibold mb-0">Wage Description</h1>
          </div>
          <div className="flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
              <Button
                className="bg-primary text-white hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                onClick={() => setAddWageDescriptionDialogOpen(true)}
              >
                <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Add Wage Description
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
                  pageSize={10}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddWageDescriptionDialog
        setOnSuccessAdd={setOnSuccessAdd}
        open={AddWageDescriptionDialogOpen}
        onOpenChange={setAddWageDescriptionDialogOpen}
      />

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
    </div>
  );
}
