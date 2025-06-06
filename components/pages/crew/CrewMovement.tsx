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
import { Filter } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Define the shape of the movement data we display
interface Movement {
  type: string;
  date: string;
  rank: string;
  // vessel: string;
}

// Table column definitions
const movementColumns: ColumnDef<Movement>[] = [
  {
    accessorKey: "type",
    header: "Movement Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const badgeClasses =
        type === "Sign in"
          ? "bg-blue-100 text-blue-800"
          : "bg-yellow-100 text-yellow-800";
      return (
        <div className="p-2 flex items-center justify-center">
          <span
            className={`flex items-center justify-center px-3 py-1 rounded-full text-sm ${badgeClasses}`}>
            {type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="p-2">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => <div className="p-2">{row.getValue("rank")}</div>,
  },
  // {
  //   accessorKey: "vessel",
  //   header: "Vessel",
  //   cell: ({ row }) => <div className="p-2">{row.getValue("vessel")}</div>,
  // },
];

// Helpers to map and format API data
const mapTransactionType = (type: number): string => {
  switch (type) {
    case 1:
      return "Sign in";
    case 2:
      return "Sign out";
    default:
      return "Unknown";
  }
};

const formatDateString = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MM/dd/yyyy");
  } catch {
    return dateString;
  }
};

export function CrewMovement() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");

  const {
    movements,
    isLoadingMovements,
    movementsError,
    fetchCrewMovements,
    resetMovements,
  } = useCrewStore();

  // Fetch movements on mount or when crewId changes
  useEffect(() => {
    if (!crewId) return;
    fetchCrewMovements(crewId);
    return () => {
      resetMovements(); // Clean up on unmount
    };
  }, [crewId, fetchCrewMovements, resetMovements]);

  // Map API data to UI model whenever movements change
  useEffect(() => {
    const mapped = movements.map((m) => ({
      type: mapTransactionType(m.TransactionType),
      date: formatDateString(m.TransactionDate),
      rank: m.Rank,
      vessel: m.Vessel,
    }));
    setFilteredMovements(mapped);
  }, [movements]);

  // Handle vessel filter
  const handleVesselChange = (value: string) => {
    setSelectedVessel(value);
    const mapped = movements.map((m) => ({
      type: mapTransactionType(m.TransactionType),
      date: formatDateString(m.TransactionDate),
      rank: m.Rank,
      vessel: m.Vessel,
    }));

    if (value) {
      setFilteredMovements(mapped.filter((m) => m.vessel === value));
    } else {
      setFilteredMovements(mapped);
    }
  };

  if (movementsError) {
    return (
      <div className="text-center text-red-500">Error: {movementsError}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vessel selection and filter */}
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
                  onValueChange={handleVesselChange}>
                  <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
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
            onClick={() => handleVesselChange(selectedVessel)}>
            <Filter className="h-5 w-5 text-primary mr-2" />
            <span className="text-gray-700 font-medium">
              Filter By Movement Type
            </span>
          </Button>
        </div>
      </div>

      {/* Movement history table */}
      <div className="border rounded-md overflow-hidden pb-3">
        {isLoadingMovements ? (
          <div className="p-4 text-center text-gray-500">
            Loading movements...
          </div>
        ) : filteredMovements.length > 0 ? (
          <DataTable
            columns={movementColumns}
            data={filteredMovements}
            pagination={filteredMovements.length > 10}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">
            No movement records found.
          </div>
        )}
      </div>
    </div>
  );
}
