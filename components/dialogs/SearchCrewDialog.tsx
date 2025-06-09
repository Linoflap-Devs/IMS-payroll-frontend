"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getCrewList } from "@/src/services/crew/crew.api";
import { useDebounce } from "@/lib/useDebounce";

// Sample off-board crew data
const offBoardCrewData = [
  { id: "1012", name: "Juan Dela Cruz", status: "Off board", rank: "Captain" },
  {
    id: "1012",
    name: "Tony Tony Chapper",
    status: "Off board",
    rank: "Chief Engineer",
  },
  {
    id: "1012",
    name: "Maria Isabella De La Cruz Santos",
    status: "Off board",
    rank: "First Officer",
  },
  {
    id: "1012",
    name: "Francisco Javier Gutierrez Delos Reyes",
    status: "Off board",
    rank: "Second Officer",
  },
  {
    id: "1012",
    name: "Jose Luis Tomas Lopez Rivera",
    status: "Off board",
    rank: "Third Officer",
  },
  {
    id: "1012",
    name: "Rafael Alberto Pimentel Diaz",
    status: "Off board",
    rank: "Chief Engineer",
  },
  {
    id: "1012",
    name: "Carlos Antonio Aquino Velasco",
    status: "Off board",
    rank: "Second Engineer",
  },
  {
    id: "1012",
    name: "Ana Gabriela Mendoza Quijano",
    status: "Off board",
    rank: "Third Engineer",
  },
];

type OffBoardCrew = (typeof offBoardCrewData)[number];

interface SearchCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrewSelect: (crew: OffBoardCrew) => void;
}

interface IOffBoardCrew {
  CrewCode: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  RankID: number;
  Rank: string;
  CrewStatusID: number;
  AccountValidation: string | null;
  IsActive: number;
}

export function SearchCrewDialog({
  open,
  onOpenChange,
  onCrewSelect,
}: SearchCrewDialogProps) {
  const [crews, setCrews] = useState<IOffBoardCrew[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (open) {
      getCrewList()
        .then((response) => {
          if (response.success) {
            setCrews(response.data.filter((crew) => crew.CrewStatusID === 2));
          } else {
            console.error("Failed to fetch crew list:", response.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching crew list:", error);
        });
    }
  }, [open]);

  const columns: ColumnDef<IOffBoardCrew>[] = [
    {
      accessorKey: "CrewCode",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            onCrewSelect(row.original);
            onOpenChange(false);
          }}>
          {row.getValue("CrewCode")}
        </div>
      ),
    },
    {
      accessorKey: "LastName",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            onCrewSelect(row.original);
            onOpenChange(false);
          }}>
          {row.getValue("LastName")}
        </div>
      ),
    },
    {
      accessorKey: "Rank",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            onCrewSelect(row.original);
            onOpenChange(false);
          }}>
          {row.getValue("Rank")}
        </div>
      ),
    },
    {
      accessorKey: "CrewStatus",
      cell: ({ row }) => {
        const status = row.getValue("CrewStatus") as string;
        return (
          <div
            className="cursor-pointer"
            onClick={() => {
              onCrewSelect(row.original);
              onOpenChange(false);
            }}>
            <span
              className={`${
                status === "Off board"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              } px-2 py-0.5 rounded-full text-xs`}>
              {status}
            </span>
          </div>
        );
      },
    },
  ];

  // Filter crew based on search term
  const filteredCrew = crews.filter(
    (crew) =>
      crew.FirstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      crew.LastName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      crew.CrewCode.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-[#FCFCFC]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-semibold text-[#2F3593] text-center">
            Search Crew
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search Crew name or Crew Code....."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-[#EAEBF9]"
            />
          </div>

          {/* Crew Table */}
          <div className="rounded-md border max-h-[300px] overflow-y-auto">
            <DataTable
              columns={columns}
              data={filteredCrew}
              pagination={false}
              hideHeader={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
