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

interface Movement {
  Vessel: string;
  SignOnDate?: string;
  SignOffDate?: string;
  Rank: string;
}

// Table column definitions
const movementColumns: ColumnDef<Movement>[] = [
  {
    accessorKey: "Vessel",
    header: "Vessel",
    cell: ({ row }) => (
      <div className="p-2">{row.getValue("Vessel")}</div>
    ),
  },
  {
    accessorKey: "SignOnDate",
    header: "Sign in",
    cell: ({ row }) => {
      const date = row.getValue("SignOnDate") as string;
      const formatted = date ? format(new Date(date), "MMM dd, yyyy") : "-";
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
    header: "Sign out",
    cell: ({ row }) => {
      const date = row.getValue("SignOffDate") as string;
      const formatted = date ? format(new Date(date), "MMM dd, yyyy") : "-";
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
    cell: ({ row }) => (
      <div className="p-2">{row.getValue("Rank")}</div>
    ),
  },
];

export function CrewMovement() {
  const searchParams = useSearchParams();
  const crewId = searchParams.get("id");
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");

  const {
    movements,
    isLoadingMovements,
    movementsError,
    fetchCrewMovements,
    resetMovements,
  } = useCrewStore();
  //console.log(movements);

  const clearFilters = () => {
    setSelectedVessel("all");
    setFilteredMovements(movements);
  };

  useEffect(() => {
    if (!crewId) return;
    fetchCrewMovements(crewId);
    return () => {
      resetMovements();
    };
  }, [crewId, fetchCrewMovements, resetMovements]);

  useEffect(() => {
    setFilteredMovements(movements);
  }, [movements]);

  // Handle vessel filter
  const handleVesselChange = (value: string) => {
    setSelectedVessel(value);

    if (value === "all") {
      setFilteredMovements(movements); // show all
    } else {
      setFilteredMovements(movements.filter((m) => m.Vessel === value));
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
                  onValueChange={handleVesselChange}>
                  <SelectTrigger className="h-full w-full border-0 shadow-none focus:ring-0 rounded-none px-4 font-medium cursor-pointer">
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All Vessels</SelectItem>
                    {Array.from(new Set(movements.map((m) => m.Vessel))).map((vessel) => (
                      <SelectItem key={vessel} value={vessel}>
                        {vessel}
                      </SelectItem>
                    ))}
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
            <span className="text-gray-700 font-medium">
              Clear Select 
            </span>
          </Button>
        </div>
      </div>

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
