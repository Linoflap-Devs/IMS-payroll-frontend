"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCrewStore } from "@/src/store/useCrewStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import {
  CheckCircle,
  Loader2,
  MinusCircle,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { generateMovementHistoryPDF } from "@/components/PDFs/movmentHistoryPDF";
import {
  CrewMovementHistory,
  deleteMovement,
  getCrewMovementHistory,
} from "@/src/services/crew/crew.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiOutlinePrinter } from "react-icons/ai";
import { generateMovementHistoryExcel } from "@/components/Excels/movementHistoryExcel";
import Swal from "sweetalert2";
import { EditMovementDialog } from "@/components/dialogs/EditCrewMovementDialog";
import { toast } from "@/components/ui/use-toast";

export interface Movement {
  VesselName?: any;
  VesselID?: number;
  MovementDetailID: number;
  Vessel: string;
  SignOnDate?: Date;
  SignOffDate?: Date;
  Rank: string;
}

export function CrewMovement() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [crewMovementHistory, setCrewMovementHistory] = useState<CrewMovementHistory[]>([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [editMovementDialogOpen, setEditMovementDialogOpen] = useState(false);

  const {
    movements,
    isLoadingMovements,
    movementsError,
    fetchCrewMovements,
    resetMovements,
  } = useCrewStore();

  const clearFilters = () => {
    setSelectedVessel("all");
    setFilteredMovements(movements);
  };

  useEffect(() => {
    if (!crewId) return;
    const fetchMovementHistory = async () => {
      try {
        const result = await getCrewMovementHistory(crewId || undefined);
        setCrewMovementHistory(result.data);
      } catch (error) {
        console.error("Failed to fetch crew movement history:", error);
      }
    };

    fetchMovementHistory();
  }, []);

  useEffect(() => {
    if (!crewId) return;
    fetchCrewMovements(crewId);

    return () => {
      resetMovements();
    };
  }, [crewId, fetchCrewMovements, resetMovements]);

  useEffect(() => {
    if (movements.length > 0 && filteredMovements.length === 0) {
      setFilteredMovements(movements);
    }
  }, [movements]);

  const handleVesselChange = (value: string) => {
    setSelectedVessel(value);

    if (value === "all") {
      setFilteredMovements(movements);
    } else {
      setFilteredMovements(movements.filter((m) => m.Vessel === value));
    }
  };

  const movementColumns: ColumnDef<Movement>[] = [
    {
      accessorKey: "Vessel",
      header: "Vessel",
      cell: ({ row }) => <div className="p-2">{row.getValue("Vessel")}</div>,
    },
    {
      accessorKey: "SignOnDate",
      header: "Sign on",
      cell: ({ row }) => {
        const date = row.getValue("SignOnDate") as string;
        const formatted = date
          ? format(new Date(date), "MMM dd, yyyy")
          : "----------";
        return (
          <div className="p-2 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {formatted}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "SignOffDate",
      header: "Sign off",
      cell: ({ row }) => {
        const date = row.getValue("SignOffDate") as string;
        const formatted = date
          ? format(new Date(date), "MMM dd, yyyy")
          : "----------";
        return (
          <div className="p-2 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              {formatted}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Rank",
      header: "Rank",
      cell: ({ row }) => <div className="p-2">{row.getValue("Rank")}</div>,
    },
    {
      accessorKey: "Promotion",
      header: "Promotion",
      cell: ({ row }) => {
        const value = row.getValue("Promotion");
        return (
          <div className="p-2 flex items-center justify-center">
            {value === 1 ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                <CheckCircle className="mr-1 w-4 h-4" />
                Promoted
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
                <MinusCircle className="mr-1 w-4 h-4" />
                ----------
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const movementId = row.original.MovementDetailID;
        const vesselName = row.original.VesselName;

        const handleDelete = async (movementId: number) => {
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
              text: `Are you sure you want to delete this movement ${movementId}? This action cannot be undone.`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes, delete it!",
              cancelButtonText: "No, cancel!",
              reverseButtons: true,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                try {

                  if (!crewId) {
                    console.error("Crew ID is missing");
                    return;
                  }

                  // Delete the crew member
                  await deleteMovement(crewId, movementId);

                  setFilteredMovements(prev =>
                    prev.filter(m => m.MovementDetailID !== movementId)
                  );

                  toast({
                    title: "Deleted!",
                    description: "The movement has been successfully deleted.",
                    variant: "success"
                  })
                  // swalWithBootstrapButtons.fire({
                  //   title: "Deleted!",
                  //   text: "The movement has been successfully deleted.",
                  //   icon: "success",
                  // });
                } catch (error) {
                  console.error("Error deleting crew:", error);
                  toast({
                    title: "Error!",
                    description: "There was an error deleting the movement.",
                    variant: "destructive",
                  });
                }
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                toast({
                  title: "Cancelled",
                  description: "Process Cancelled.",
                  variant: "destructive",
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
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedMovement(row.original);
                    setEditMovementDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Movement
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(movementId)}
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

  const handlePdfExport = async () => {
    setIsPdfLoading(true);
    try {
      await generateMovementHistoryPDF(
        crewMovementHistory,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleExcelExport = async () => {
    setIsExcelLoading(true);
    try {
      await generateMovementHistoryExcel(
        crewMovementHistory,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleCrewMovementUpdated = async (updatedMovement: Movement) => {
    console.log("Movement updated:", updatedMovement);

    try {
      const response = await getCrewMovementHistory(crewId ?? undefined);

      if (response.success) {

        setFilteredMovements(prev =>
          prev.map(mv =>
            mv.MovementDetailID === updatedMovement.MovementDetailID
              ? {
                ...mv,
                Vessel: updatedMovement.Vessel,
                Rank: updatedMovement.Rank,
                SignOffDate: updatedMovement.SignOffDate,
                SignOnDate: updatedMovement.SignOnDate,
              }
              : mv
          )
        );

      } else {
        console.error("Failed to fetch updated movement history:", response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to refresh movement history.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching movement history:", error);
      toast({
        title: "Error",
        description: "Unexpected error while refreshing movement history.",
        variant: "destructive",
      });
    }
  };

  if (movementsError) {
    return (
      <div className="text-center text-red-500">Error: {movementsError}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative rounded-lg border shadow-sm overflow-hidden">
            <div className="flex h-11 w-full">
              <div className="flex items-center px-4 bg-gray-50 border-r">
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  Select Vessel
                </span>
              </div>
              <div className="flex-1 w-full flex items-center">
                <Select
                  value={selectedVessel}
                  onValueChange={handleVesselChange}
                >
                  <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All Vessels</SelectItem>
                    {Array.from(new Set(movements.map((m) => m.Vessel))).map(
                      (vessel) => (
                        <SelectItem key={vessel} value={vessel}>
                          {vessel}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
            variant="outline"
            className="h-11 px-5 border rounded-lg shadow-sm cursor-pointer"
            onClick={clearFilters}
          >
            <span className="text-gray-700 font-medium">Clear Select</span>
          </Button>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-11 px-4 text-sm">
                <AiOutlinePrinter className="mr-2 h-4 w-4" />
                Print Summary
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="text-sm w-48">
              <DropdownMenuItem
                onClick={handlePdfExport}
                disabled={isPdfLoading}
              >
                {isPdfLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting PDF...
                  </>
                ) : (
                  <>
                    <AiOutlinePrinter className="mr-2 h-4 w-4" />
                    Export PDF
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleExcelExport}
                disabled={isExcelLoading}
              >
                {isExcelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting Excel...
                  </>
                ) : (
                  <>
                    <AiOutlinePrinter className="mr-2 h-4 w-4" />
                    Export Excel
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden pb-3">
        {isLoadingMovements ? (
          <div className="p-4 py-8 text-center text-gray-500">
            Loading movements...
          </div>
        ) : filteredMovements.length > 0 ? (
          <DataTable
            columns={movementColumns}
            data={filteredMovements}
            pageSize={6}
            pagination={filteredMovements.length > 10}
          />
        ) : (
          <div className="p-4 py-8 text-center text-gray-500">
            No movement records found.
          </div>
        )}
      </div>

      {selectedMovement && editMovementDialogOpen && (
        <EditMovementDialog
          open={editMovementDialogOpen}
          onOpenChange={setEditMovementDialogOpen}
          selectedMovement={selectedMovement ?? null}
          onSuccess={handleCrewMovementUpdated}
          CrewCode={crewId ?? ""}
        />
      )}
    </div>
  );
}
