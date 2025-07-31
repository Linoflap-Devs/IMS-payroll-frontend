"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ChevronLeft,
  ArrowDownUp,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getVesselCrew,
  VesselCrewResponse,
} from "@/src/services/vessel/vessel.api";
import { useSearchParams } from "next/navigation";
import { JoinCrewDialog } from "../dialogs/JoinCrewDialog";
import { RepatriateCrewDialog } from "../dialogs/RepatriateCrewDialog";
import { Checkbox } from "../ui/checkbox";
import { TbShipOff } from "react-icons/tb";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useDebounce } from "@/lib/useDebounce";
import { getCrewList } from "@/src/services/crew/crew.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ISelectedCrew {
  id: number;
  name: string;
  status: string;
  rank: string;
  crewCode: string;
  currentVessel?: string;
  vesselId?: number;
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

export default function CrewMovementList() {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("id");
  const vesselName = searchParams.get("vesselName");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("join-crew");
  const [vesselData, setVesselData] = useState<VesselCrewResponse | null>(null);
  const [onSuccess, setOnSuccess] = useState(false);
  const [selectedOffBoardCrew, setSelectedOffBoardCrew] = useState<IOffBoardCrew[] | null>([]);
  const [joinCrewDialogOpen, setJoinCrewDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<ISelectedCrew[]>([]);
  const [repatriateDialogOpen, setRepatriateDialogOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const debouncedSearch = useDebounce(searchTerm, 500);
  const [displayedCrews, setDisplayedCrews] = useState<IOffBoardCrew[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allCrews, setAllCrews] = useState<IOffBoardCrew[]>([]);
  const [rankFilter, setRankFilter] = useState("all");

  useEffect(() => {
    const fetchVesselCrew = async () => {
      if (!vesselId) return;
      setIsLoading(true);
      try {
        const response = await getVesselCrew(vesselId);
        setVesselData(response);
      } catch (error) {
        console.error("Error fetching vessel crew:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVesselCrew();
  }, [vesselId, onSuccess]);

  useEffect(() => {
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
  }, []);

  const selectedCrews = Object.keys(selectedRowIds)
    .filter((id) => selectedRowIds[id])
    .map((id) => displayedCrews[parseInt(id, 10)]);

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

  const selectedRows = crewData.filter((row) => selectedRowIds[row.crewCode]);

  const filteredCrewData = useMemo(() => {
    return crewData.filter((crew) => {
      const matchesSearch = searchTerm
        ? `${crew.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.crewCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.rank.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesRank = rankFilter && rankFilter !== "all"
        ? crew.rank.toLowerCase() === rankFilter.toLowerCase()
        : true;

      return matchesSearch && matchesRank;
    });
  }, [crewData, searchTerm, rankFilter]);

  const filteredJoinCrewData = useMemo(() => {
    return displayedCrews.filter((crew) => {
      const matchesSearch = searchTerm
        ? `${crew.FirstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.CrewCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.Rank.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesRank = rankFilter && rankFilter !== "all"
        ? crew.Rank.toLowerCase() === rankFilter.toLowerCase()
        : true;

      return matchesSearch && matchesRank;
    });
  }, [displayedCrews, searchTerm, rankFilter]);

  const columnJoin: ColumnDef<IOffBoardCrew>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "CrewCode",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <p>Crew Code</p>

          <ArrowDownUp size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("CrewCode")}</div>
      ),
    },
    {
      id: "Crew Name",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <p>Crew Name</p>
          <ArrowDownUp size={15} />
        </div>
      ),
      accessorFn: (row) => `${row.LastName}, ${row.FirstName}`, // for sorting
      cell: ({ row }) => {
        const lastName = row.original.LastName;
        const firstName = row.original.FirstName;

        return <div className="text-left">{`${lastName}, ${firstName}`}</div>;
      },
    },
    {
      accessorKey: "Rank",
      header: ({ column }) => (
        <div
          className="flex items-center justify-center cursor-pointer text-left space-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <p>Rank</p>
          <ArrowDownUp size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("Rank")}</div>
      ),
    },
    {
      accessorKey: "CrewStatusID",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer justify-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("CrewStatusID");
        return (
          <div>
            <span
              className={`${status === 2
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

  const columRepatriate: ColumnDef<(typeof crewData)[number]>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
  };

  const handleRepatriate = () => {
    if (selectedRows.length === 0) {
      console.log("No rows selected for repatriation.");
      return;
    }

    const enrichedSelectedRows = selectedRows.map((crew) => ({
      ...crew,
      currentVessel: vesselName || "",
      vesselId: vesselId ? Number(vesselId) : 0,
    }));

    setSelectedCrew(enrichedSelectedRows);

    console.log(enrichedSelectedRows); // now working
    setRepatriateDialogOpen(true);
  };

  const handleJoin = () => {
    if (!selectedCrews || selectedCrews.length === 0) {
      console.log("No crews selected.");
      return;
    }

    const mappedSelectedCrew: ISelectedCrew[] = selectedCrews.map((crew, idx) => ({
      id: idx + 1,
      name: `${crew.FirstName} ${crew.MiddleName ? crew.MiddleName + " " : ""}${crew.LastName}`,
      status: "Off board", // assuming all selected are off-board
      rank: crew.Rank,
      crewCode: crew.CrewCode,
      vesselId: 0,
    }));

    setSelectedCrew(mappedSelectedCrew);
    setSelectedOffBoardCrew(selectedCrews);
    setJoinCrewDialogOpen(true);
  };

  return (
    <div className="h-full w-full p-3 pt-3 overflow-hidden">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Hide scrollbar for all scrollable elements in the component */
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
        <div className="pt-3 pb-1 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
          <div className="flex flex-col gap-2 mb-5">
            <div className="flex items-center gap-2">
              <Link href="/home/crew-movement">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-semibold mb-0">Vessel {vesselName}</h1>
            </div>
          </div>

          <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full flex flex-col h-full"
            >
              <div className="border-b">
                <div className="px-4 pt-1">
                  <TabsList className="bg-transparent p-0 h-8 w-full flex justify-start space-x-8">
                    <TabsTrigger
                      value="join-crew"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Join Crews
                    </TabsTrigger>
                    <TabsTrigger
                      value="repatriate-crew"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Repatriate Crews
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent
                value="join-crew"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                    <div className="relative w-full md:flex-1">
                      <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
                      <Input
                        placeholder="Search Crew name or Crew Code....."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-[#EAEBF9]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                      <Select
                        value={rankFilter}
                        onValueChange={setRankFilter}
                      >
                        <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="All Ranks" />
                        </SelectTrigger>

                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="all">All Ranks</SelectItem>
                          {[...new Set(displayedCrews.map((item) => item.Rank).filter(Boolean))].map(
                            (rank) => (
                              <SelectItem key={rank} value={rank}>
                                {rank}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <Button
                              className="gap-2 h-11 px-5"
                              onClick={handleJoin}
                              disabled={selectedCrews.length === 0}
                            >
                              <Plus />
                              Join Crew(s)
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {selectedCrews.length === 0 && (
                          <TooltipContent className="text-sm">
                            Select Crew(s) to join.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  </div>

                  <div className="rounded-md border overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center">Loading crew data...</div>
                    ) : (
                      <DataTable
                        columns={columnJoin}
                        data={filteredJoinCrewData}
                        pageSize={10}
                        rowSelection={selectedRowIds}
                        onRowSelectionChange={setSelectedRowIds}
                      />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="repatriate-crew"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
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
                      <Select
                        value={rankFilter}
                        onValueChange={setRankFilter}
                      >
                        <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="All Ranks" />
                        </SelectTrigger>

                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="all">All Ranks</SelectItem>
                          {[...new Set(crewData.map((item) => item.rank).filter(Boolean))].map(
                            (rank) => (
                              <SelectItem key={rank} value={rank}>
                                {rank}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <Button
                              className="gap-2 h-11 px-5"
                              onClick={handleRepatriate}
                              disabled={selectedRows.length === 0}
                            >
                              <TbShipOff />
                              Repatriate Crews
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {selectedRows.length === 0 && (
                          <TooltipContent className="text-sm">
                            Select Crew(s) to repatriate.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>

                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <p className="text-muted-foreground">Loading crew data...</p>
                    </div>
                  ) : (
                    <div className="bg-[#F9F9F9] rounded-md border pb-3">
                      <DataTable
                        columns={columRepatriate}
                        data={filteredCrewData}
                        pageSize={10}
                        rowSelection={selectedRowIds}
                        onRowSelectionChange={setSelectedRowIds}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <RepatriateCrewDialog
        open={repatriateDialogOpen}
        onOpenChange={setRepatriateDialogOpen}
        setOnSuccess={setOnSuccess}
        crewMembers={selectedCrew as {
          id: number;
          name: string;
          status: string;
          rank: string;
          crewCode: string;
          currentVessel?: string;
          country?: string;
          vesselId: number;
        }[]}
        crewMember={[]}  // temporarily   
      //selectedCrews={selectedCrew.length > 0 ? selectedCrew : []} 
      // crewMember={{
      //   id: 0,
      //   name: "",
      //   status: "",
      //   rank: "",
      //   crewCode: "",
      //   currentVessel: undefined,
      //   country: undefined,
      //   vesselId: 0
      // }}
      // crewMember={
      //   selectedCrew
      //     ? {
      //       ...selectedCrew,
      //       currentVessel: vesselName || "",
      //       vesselId: vesselId ? Number(vesselId) : 0,
      //     }
      //     : {
      //       id: 0,
      //       name: "",
      //       status: "",
      //       rank: "",
      //       crewCode: "",
      //       currentVessel: "",
      //       vesselId: 0,
      //     }
      // }
      />

      {selectedOffBoardCrew && (
        <JoinCrewDialog
          open={joinCrewDialogOpen}
          setOnSuccess={setOnSuccess}
          onOpenChange={setJoinCrewDialogOpen}
          crewMember={selectedOffBoardCrew}
          crewMembers={selectedOffBoardCrew}
          SelectedVesselID={Number(vesselId) || 0}
          SelectedVesselName={vesselName ?? ""}
        //crewMember={undefined}        
        />
      )}
    </div>
  );
}
