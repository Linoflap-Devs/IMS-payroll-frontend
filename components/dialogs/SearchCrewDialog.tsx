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

interface SearchCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrewSelect: (crew: IOffBoardCrew) => void;
}
export interface IOffBoardCrew {
  CrewCode: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  RankID: number;
  Rank: string;
  CrewStatusID: number;
  AccountValidation: number | null;
  IsActive: number;
}

export function SearchCrewDialog({
  open,
  onOpenChange,
  onCrewSelect,
}: SearchCrewDialogProps) {
  const [allCrews, setAllCrews] = useState<IOffBoardCrew[]>([]);
  const [displayedCrews, setDisplayedCrews] = useState<IOffBoardCrew[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getCrewList()
        .then((response) => {
          if (response.success) {
            const offBoardCrews = response.data.filter(
              (crew) => crew.CrewStatusID === 2
            );
            setAllCrews(offBoardCrews);
            setDisplayedCrews(offBoardCrews.slice(0, 50));
          } else {
            console.error("Failed to fetch crew list:", response.message);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching crew list:", error);
          setIsLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const filtered = allCrews.filter(
        (crew) =>
          crew.FirstName.toLowerCase().includes(searchLower) ||
          crew.LastName.toLowerCase().includes(searchLower) ||
          crew.CrewCode.toLowerCase().includes(searchLower)
      );
      setDisplayedCrews(filtered.slice(0, 50));
    } else {
      setDisplayedCrews(allCrews.slice(0, 50));
    }
  }, [debouncedSearch, allCrews]);

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
      accessorKey: "CrewStatusID",
      cell: ({ row }) => {
        const status = row.getValue("CrewStatusID");
        return (
          <div
            className="cursor-pointer"
            onClick={() => {
              onCrewSelect(row.original);
              onOpenChange(false);
            }}>
            <span
              className={`${
                status === 2
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              } px-2 py-0.5 rounded-full text-xs`}>
              {status === 2 ? "Off board" : "On board"}
            </span>
          </div>
        );
      },
    },
  ];

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
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <DataTable
                columns={columns}
                data={displayedCrews}
                pagination={false}
                hideHeader={true}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
