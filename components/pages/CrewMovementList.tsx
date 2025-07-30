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
import { IOffBoardCrew, SearchCrewDialog } from "../dialogs/SearchCrewDialog";
import { JoinCrewDialog } from "../dialogs/JoinCrewDialog";
import { RepatriateCrewDialog } from "../dialogs/RepatriateCrewDialog";
import { Checkbox } from "../ui/checkbox";
import { TbShipOff } from "react-icons/tb";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface ISelectedCrew {
  id: number;
  name: string;
  status: string;
  rank: string;
  crewCode: string;
  currentVessel?: string;
  vesselId?: number;
  // signOnDate?: string;
  // currentVessel?: string;
}

export default function CrewMovementList() {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("id");
  const vesselName = searchParams.get("vesselName");
  const [searchTerm, setSearchTerm] = useState("");
  //const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("join-crew");
  const [vesselData, setVesselData] = useState<VesselCrewResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [onSuccess, setOnSuccess] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [searchCrewDialogOpen, setSearchCrewDialogOpen] = useState(false);
  const [selectedOffBoardCrew, setSelectedOffBoardCrew] =
    useState<IOffBoardCrew | null>(null);
  const [joinCrewDialogOpen, setJoinCrewDialogOpen] = useState(false);
  //const [selectedCrew, setSelectedCrew] = useState<ISelectedCrew>();
  const [selectedCrew, setSelectedCrew] = useState<ISelectedCrew[]>([]);
  const [repatriateDialogOpen, setRepatriateDialogOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    const fetchVesselCrew = async () => {
      if (!vesselId) return;
      setLoading(true);
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
  const selectedRows = crewData.filter((row) => selectedRowIds[row.crewCode]);

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

            {/* <Card className="p-6 bg-[#F5F6F7]">
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
            </Card> */}

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
                      Join Crew
                    </TabsTrigger>
                    <TabsTrigger
                      value="repatriate-crew"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Repatriate Crew(s)
                    </TabsTrigger>
                    {/* <TabsTrigger
                      value="promote-crew"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Promote Crew
                    </TabsTrigger> */}
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
                        placeholder="Search crew by name, code, or rank..."
                        className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                      <Button
                        className="gap-2 h-11 px-5"
                        onClick={() => setSearchCrewDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Join Crew
                      </Button>
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <p className="text-muted-foreground">Loading vessel data...</p>
                    </div>
                  ) : (
                    <div className="bg-[#F9F9F9] rounded-md border pb-3">
                      <DataTable
                        columns={columns}
                        data={filteredCrewData}
                        pageSize={7}
                      />
                    </div>
                  )}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block">
                            <Button
                              className="gap-2 h-11 px-5"
                              onClick={handleRepatriate}
                              disabled={selectedRows.length === 0}
                            >
                              <TbShipOff />
                              Repatriate Crew
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
                      <p className="text-muted-foreground">Loading vessel type data...</p>
                    </div>
                  ) : (
                    <div className="bg-[#F9F9F9] rounded-md border pb-3">
                      <DataTable
                        columns={columRepatriate}
                        data={crewData}
                        pageSize={7}
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

      <SearchCrewDialog
        open={searchCrewDialogOpen}
        onOpenChange={setSearchCrewDialogOpen}
        onCrewSelect={(crew) => {
          setSelectedOffBoardCrew(crew);
          setJoinCrewDialogOpen(true);
        }}
      />

      {selectedOffBoardCrew && (
        <JoinCrewDialog
          open={joinCrewDialogOpen}
          setOnSuccess={setOnSuccess}
          onOpenChange={setJoinCrewDialogOpen}
          crewMember={selectedOffBoardCrew}
          SelectedVesselID={Number(vesselId) || 0}
          SelectedVesselName={vesselName ?? ""}
        />
      )}
    </div>
  );
}
