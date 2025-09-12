"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Ship,
  ChevronLeft,
  Check,
  ArrowDownUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import {
  getVesselCrew,
  type VesselCrewResponse,
} from "@/src/services/vessel/vessel.api";

export default function VesselCrewList() {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("id");
  const vesselName = searchParams.get("vesselName");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [vesselData, setVesselData] = useState<VesselCrewResponse | null>(null);
  const [onSuccess, setOnSuccess] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);

  useEffect(() => {
    const fetchVesselCrew = async () => {
      if (!vesselId) return;
      try {
        const response = await getVesselCrew(vesselId);
        setVesselData(response);
      } catch (error) {
        console.error("Error fetching vessel crew:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVesselCrew();
    if (onSuccess) {
      fetchVesselCrew().then(() => {
        setOnSuccess(false);
      });
    }

    fetchVesselCrew();
  }, [vesselId, onSuccess]);

  const crewData = useMemo(
    () =>
      vesselData?.data.Crew.map((crew, index) => ({
        id: index + 1,
        name: `${crew.FirstName} ${crew.MiddleName ? crew.MiddleName + " " : ""
          }${crew.LastName}`,
        status: crew.Status === 1 ? "On board" : "Inactive",
        rank: crew.Rank,
        crewCode: crew.CrewCode,
        country: crew.Country,
      })) || [],
    [vesselData]
  );

  // Extract unique ranks from crew data
  const uniqueRanks = useMemo(() => {
    const ranks = crewData.map((crew) => crew.rank);
    return [...new Set(ranks)].sort();
  }, [crewData]);

  // Filter crew data based on search term and selected rank
  const filteredCrewData = useMemo(() => {
    return crewData.filter((crew) => {
      const matchesSearch = searchTerm
        ? crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.crewCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.rank.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesRank = selectedRank ? crew.rank === selectedRank : true;

      return matchesSearch && matchesRank;
    });
  }, [crewData, searchTerm, selectedRank]);

  const handleClearRankFilter = () => {
    setSelectedRank(null);
  };

  const columns: ColumnDef<(typeof crewData)[number]>[] = [
    {
      accessorKey: "crewCode",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <p>Crew Code</p>

          <ArrowDownUp size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("crewCode")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <p>Crew Name</p>

          <ArrowDownUp size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <p>Rank</p>

          <ArrowDownUp size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("rank")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer justify-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={`${status === "On board"
                  ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
                }`}>
              {status}
            </Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full p-6 pt-5 overflow-hidden">
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
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2">
          <Link href="/home/vessel">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold mb-0">Vessel Crew List</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {vesselData?.data.VesselInfo.VesselCode}
              </div>
              <h2 className="text-2xl font-semibold">
                {vesselData?.data.VesselInfo.VesselName}
              </h2>
              <Badge
                variant="secondary"
                className={`mt-2 px-6 py-0 ${vesselData?.data.VesselInfo.Status === 1
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {vesselData?.data.VesselInfo.Status === 1
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {vesselData?.data.VesselInfo.VesselType}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm text-center">
                  <p className="flex items-center justify-center font-semibold px-3">
                    {vesselData?.data.VesselInfo.Principal}
                  </p>
                  <div className="text-gray-500 text-xs flex items-center justify-center">
                    Principal Name
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center gap-4 mt-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search Crew...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-[var(--searchBackground)]"
            />
          </div>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-11 px-5"
                  disabled={!filteredCrewData}
                >
                  <Filter className="h-4 w-4" />
                  {selectedRank ? `Rank: ${selectedRank}` : "Filter by Rank"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {uniqueRanks.map((rank) => (
                  <DropdownMenuItem
                    key={rank}
                    onClick={() => setSelectedRank(rank)}
                    className="flex justify-between"
                  >
                    {rank}
                    {selectedRank === rank && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
                {selectedRank && (
                  <DropdownMenuItem
                    onClick={handleClearRankFilter}
                    className="text-blue-600 font-medium"
                  >
                    Clear Filter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              Loading...
            </div>
          ) : (
            <DataTable columns={columns} data={filteredCrewData} pageSize={6} />
          )}
        </div>
      </div>
    </div>
  );
}
