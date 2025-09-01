"use client";

import { useState, useEffect } from "react";
import { useCrewStore } from "@/src/store/useCrewStore";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CrewItem, UpdateCrewDataForm } from "../../src/services/crew/crew.api";
import { EditCrewGovtRecordsDialog } from "../dialogs/EditCrewGovtRecordsDialog";

export default function CrewGovtRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("all");
  const { crews, isLoading, error } = useCrewStore();
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({
    CrewCode: true,
    FirstName: true,
    RankID: true,
    SSSNumber: true,
    PhilHealthNumber: true,
    TaxIDNumber: true,
    action: true,
  });
  const [selecteCrewData, setSelectedCrewData] = useState<CrewItem | null>(null);
  const [editselectedCrewDialogOpen, setEditselectedCrewDialogOpen] = useState(false);
  const [validationFilter, setValidationFilter] = useState("active");
  const fetchCrews = useCrewStore((state) => state.fetchCrews);

  useEffect(() => {
    fetchCrews();
  }, [fetchCrews]);

  const filteredCrew = crews.filter((crew) => {
    const matchesSearch =
      crew.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.CrewCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.Rank.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIsActive =
      validationFilter === "all" ||
      (crew.IsActive === 1 && validationFilter.toLowerCase() === "active") ||
      (crew.IsActive !== 1 && validationFilter.toLowerCase() === "inactive");

    const matchesRank =
      rankFilter === "all" ||
      crew.RankID.toString() === rankFilter.toLowerCase();

    return matchesSearch && matchesRank && matchesIsActive;
  });

  const uniqueRanks = Array.from(
    new Map(crews.map((crew) => [crew.RankID, crew.Rank])).entries()
  ).map(([id, name]) => ({ id, name }));

  const Crewcolumns: ColumnDef<CrewItem>[] = [
    {
      id: "CrewCode",
      accessorKey: "CrewCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Crew Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("CrewCode") as string).trim()}
        </div>
      ),
    },
    {
      id: "FirstName",
      accessorKey: "FirstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Crew Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const firstName = row.original.FirstName || "";
        const middleName = row.original.MiddleName || "";
        const lastName = row.original.LastName || "";
        const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
        return (
          <div className="text-xs sm:text-sm text-center">
            {`${firstName}${middleInitial} ${lastName}`.trim()}
          </div>
        );
      },
    },
    {
      id: "RankID",
      accessorKey: "RankID",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.original.Rank || row.getValue("RankID")}
        </div>
      ),
    },
    {
      id: "SSSNumber",
      accessorKey: "SSSNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SSS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("SSSNumber");
        return (
          <div className="font-medium text-xs sm:text-sm text-center">
            {row.original.SSSNumber || row.getValue("SSSNumber")}
          </div>
        );
      },
    },
    {
      id: "PhilHealthNumber",
      accessorKey: "PhilHealthNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PhilHealth
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("PhilHealthNumber");
        return (
          <div className="font-medium text-xs sm:text-sm text-center">
            {row.original.PhilHealthNumber || row.getValue("PhilHealthNumber")}
          </div>
        );
      },
    },
    {
      id: "TaxIDNumber",
      accessorKey: "TaxIDNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tax
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("TaxIDNumber");
        return (
          <div className="font-medium text-xs sm:text-sm text-center">
            {row.original.TaxIDNumber || row.getValue("TaxIDNumber")}
          </div>
        );
      },
    },
    {
      id: "HDMFNumber",
      accessorKey: "HDMFNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          HDMF Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("HDMFNumber");
        return (
          <div className="font-medium text-xs sm:text-sm text-center">
            {row.original.HDMFNumber || row.getValue("HDMFNumber")}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
                  setSelectedCrewData(row.original);
                  setEditselectedCrewDialogOpen(true);
                }}>
                <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Edit Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  const toggleColumnVisibility = (columnId: string) =>
    setColumnVisibility((prev) => ({ ...prev, [columnId]: !prev[columnId] }));

  const visibleColumns = Crewcolumns.filter(
    (col) => col.id && columnVisibility[col.id] !== false
  );

  const handleCrewDataUpdated = (updatedData: Partial<UpdateCrewDataForm>) => {
    setSelectedCrewData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...updatedData,
        // ...(updatedData.sssNumber !== undefined ? { SSSNumber: String(updatedData.sssNumber ?? "") } : {}),
        // ...(updatedData.tinNumber !== undefined ? { TaxIDNumber: String(updatedData.tinNumber ?? "") } : {}),
        // ...(updatedData.philhealthNumber !== undefined ? { PhilHealthNumber: String(updatedData.philhealthNumber ?? "") } : {}),
        // ...(updatedData.hdmfNumber !== undefined ? { HDMFNumber: String(updatedData.hdmfNumber ?? "") } : {}),
      };
    });

    fetchCrews();
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full w-full p-4 pt-2">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Crew Government Records</h1>
          </div>
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
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by rank" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Ranks</SelectItem>
                  {uniqueRanks.map((rank) => (
                    <SelectItem key={rank.id} value={rank.id.toString()}>
                      {rank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={validationFilter}
                onValueChange={setValidationFilter}
              >
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full flex-1">
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by validation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crews</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[130px] sm:min-w-[140px] w-full sm:w-auto bg-[#FFFFFF]"
                  >
                    Columns <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[180px] bg-[#FFFFFF]"
                >
                  {Crewcolumns.map((col) => {
                    if (!col.id) return null;
                    let dName = col.id;
                    if (col.id === "CrewCode") dName = "Crew Code";
                    else if (col.id === "FirstName") dName = "Name";
                    else if (col.id === "RankID")
                      dName = "Rank";
                    else if (col.id === "SSSNumber")
                      dName = "SSS Number";
                    else if (col.id === "PhilHealthNumber")
                      dName = "PhilHealth Number";
                    else if (col.id === "TaxIDNumber")
                      dName = "TaxID Number";
                    else if (col.id === "HDMFNumber")
                      dName = "HDMF Number";
                    else if (col.id === "action") dName = "Action";
                    return (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() =>
                          col.id && toggleColumnVisibility(col.id)
                        }
                      >
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
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Loading crew data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-md border pb-3">
              <DataTable columns={visibleColumns} data={filteredCrew} />
            </div>
          )}
        </div>
      </div>

      {selecteCrewData && editselectedCrewDialogOpen && (
        <EditCrewGovtRecordsDialog
          open={editselectedCrewDialogOpen}
          onOpenChange={setEditselectedCrewDialogOpen}
          crewGovtTypeData={selecteCrewData}
          onSuccess={handleCrewDataUpdated}
          setSelectedCrewData={setSelectedCrewData}
        />
      )}
    </div>
  );
}
