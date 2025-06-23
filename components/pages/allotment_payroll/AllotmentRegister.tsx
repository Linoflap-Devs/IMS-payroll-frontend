"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";
import {
  AllotmentRegisterCrew,
  AllotmentRegisterData,
  getVesselAllotmentRegister,
} from "@/src/services/payroll/payroll.api";
import { Ship } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AllotteeDistributionDialog } from "../../dialogs/AllotteeDistributionDialog";
import { getVesselList } from "@/src/services/vessel/vessel.api";
import { useDebounce } from "@/lib/useDebounce";
import { generateAllotmentPayrollRegister } from "@/components/PDFs/payrollAllotmentRegisterPDF";

interface VesselInfo {
  code: string;
  name: string;
  type: string;
  principalName: string;
}

export default function AllotmentRegisterComponent({
  vesselInfo: initialVesselInfo,
}: {
  vesselInfo?: VesselInfo;
}) {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("vesselId");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [allotmentData, setAllotmentData] = useState<AllotmentRegisterData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] =
    useState<AllotmentRegisterCrew | null>(null);
  const [isAllotteeDialogOpen, setIsAllotteeDialogOpen] = useState(false);
  const [vesselInfo, setVesselInfo] = useState<VesselInfo | undefined>(
    initialVesselInfo
  );

  function getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const mapMonth: Record<number, string> = {
    1: "JANUARY",
    2: "FEBRUARY",
    3: "MARCH",
    4: "APRIL",
    5: "MAY",
    6: "JUNE",
    7: "JULY",
    8: "AUGUST",
    9: "SEPTEMBER",
    10: "OCTOBER",
    11: "NOVEMBER",
    12: "DECEMBER",
  };

  useEffect(() => {
    const fetchAllotmentData = async () => {
      if (!vesselId) return;

      setIsLoading(true);
      try {
        const response = await getVesselAllotmentRegister(
          vesselId,
          Number(searchParams.get("month")),
          Number(searchParams.get("year"))
        );

        if (response.success && Array.isArray(response.data)) {
          // When using vesselId, we expect a single vessel in the array
          // but we keep the array structure for the DataTable
          setAllotmentData(response.data);

          console.log("Fetched vessel data:", response.data);
        } else {
          console.error("Unexpected API response format:", response);
          setAllotmentData([]);
        }
      } catch (error) {
        console.error("Error fetching allotment data:", error);
        setAllotmentData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllotmentData();
  }, [vesselId, searchParams]);

  useEffect(() => {
    if (!vesselId) return;

    getVesselList().then((response) => {
      if (response.success) {
        const vessel = response.data.find(
          (v) => v.VesselID === Number(vesselId)
        );
        if (vessel) {
          setVesselInfo({
            code: vessel.VesselCode,
            name: vessel.VesselName,
            type: vessel.VesselType,
            principalName: vessel.Principal,
          });
        }
      }
    });
  }, [vesselId]);

  // Format numbers to two decimal places with null checking
  const formatNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue?.toFixed(2);
  };

  const columns: ColumnDef<AllotmentRegisterCrew>[] = [
    {
      accessorKey: "CrewName",
      header: "Crew Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("CrewName")}</div>
      ),
    },
    {
      accessorKey: "Rank",
      header: "Rank",
    },
    {
      accessorKey: "BasicWage",
      header: "Basic Wage",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("BasicWage")}</div>
      ),
    },
    {
      accessorKey: "FixedOT",
      header: "Fixed OT",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("FixedOT")}</div>
      ),
    },
    {
      accessorKey: "GuarOT",
      header: "Guar OT",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("GuarOT")}</div>
      ),
    },
    {
      accessorKey: "DollarGross",
      header: "Dollar Gross",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("DollarGross")}</div>
      ),
    },
    {
      accessorKey: "PesoGross",
      header: "Peso Gross",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("PesoGross"))}
        </div>
      ),
    },
    {
      accessorKey: "TotalDeduction",
      header: "Total Deduction",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("TotalDeduction"))}
        </div>
      ),
    },
    {
      accessorKey: "Net",
      header: "Net",
      cell: ({ row }) => (
        <div className="text-right">{formatNumber(row.getValue("Net"))}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const crew = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCrew(crew);
                  setIsAllotteeDialogOpen(true);
                }}>
                View Allottee Distribution
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filter the crew data based on search term
  const filterCrew = allotmentData[0]?.Crew || [];
  const filteredData = filterCrew.filter((item) =>
    item.CrewName?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const testData = {
    month:
      mapMonth[
        searchParams.get("month")
          ? Number(searchParams.get("month"))
          : new Date().getMonth() + 1
      ],
    year: searchParams.get("year")
      ? Number(searchParams.get("year"))
      : new Date().getFullYear(),
    vesselName: "YODOHIME",
    exchangeRate: searchParams.get("forex"),
    dateGenerated: getCurrentDateTime(),
    currentPage: 1,
    totalPages: 20,
    crewMembers: [
      {
        name: "KURAIS, BEN-ASAL",
        rank: "CAPT,",
        basicWage: 2172.0,
        fixedOT: 0.0,
        guarOT: 0.0,
        dollarGross: 2172.0,
        pesoGross: 124520.76,
        totalDeduction: 4450.0,
        netPay: 120070.26,
        allottees: [
          {
            name: "KURAIS,MUNIRA B.",
            accountNumber: "1234-5678-910",
            bank: "BPI- ZAMBOANGA MAIN",
            allotmentAmount: 48026.49,
          },
          {
            name: "KURAIS,LINDSAY JHEN M.",
            accountNumber: "1234-5678-910",
            bank: "BPI- ZAMBOANGA MAIN",
            allotmentAmount: 12153.96,
          },
          {
            name: "KURAIS,BEN-ASAL B.",
            accountNumber: "1234-5678-910",
            bank: "BPI- DEWEY",
            allotmentAmount: 59890.31,
          },
        ],
      },
      {
        name: "PENIERO, HENRY",
        rank: "BSN",
        basicWage: 620.0,
        fixedOT: 0.0,
        guarOT: 461.6,
        dollarGross: 1081.6,
        pesoGross: 62008.13,
        totalDeduction: 3038.62,
        netPay: 58969.51,
        allottees: [
          {
            name: "PENIERO, LOTUS E.",
            accountNumber: "1234-5678-910",
            bank: "BPI- CEBU MAIN",
            allotmentAmount: 58969.51,
          },
        ],
      },
      {
        name: "PENIERO, HENRY",
        rank: "BSN",
        basicWage: 620.0,
        fixedOT: 0.0,
        guarOT: 461.6,
        dollarGross: 1081.6,
        pesoGross: 62008.13,
        totalDeduction: 3038.62,
        netPay: 58969.51,
        allottees: [
          {
            name: "PENIERO, LOTUS E.",
            accountNumber: "1234-5678-910",
            bank: "BPI- CEBU MAIN",
            allotmentAmount: 58969.51,
          },
        ],
      },
    ],
  };

  const handlePrint = () => {
    generateAllotmentPayrollRegister(testData);
  };

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
          <Link href="/home/allotment">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold mb-0">Allotment Register</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {vesselInfo?.code}
              </div>
              <h2 className="text-2xl font-semibold">{vesselInfo?.name}</h2>
              <Badge
                variant="secondary"
                className="mt-2 px-6 py-0 bg-[#DFEFFE] text-[#292F8C]">
                Active
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {vesselInfo?.type}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm text-center">
                  <p className="flex items-center justify-center font-semibold">
                    {vesselInfo?.principalName}
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
              className="pl-10 h-11 bg-[#EAEBF9]"
            />
          </div>
          <div className="flex gap-4">
            <Button
              className="gap-2 h-11 px-5"
              disabled={isLoading}
              onClick={handlePrint}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <AiOutlinePrinter className="h-4 w-4" />
                  Print Register
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading allotment data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <DataTable columns={columns} data={filteredData} pageSize={6} />
          ) : (
            <div className="flex justify-center items-center p-10">
              <p>No allotment data available for this vessel</p>
            </div>
          )}
        </div>
      </div>

      {selectedCrew && (
        <AllotteeDistributionDialog
          open={isAllotteeDialogOpen}
          onOpenChange={setIsAllotteeDialogOpen}
          allottees={selectedCrew.Allottee}
          crewName={selectedCrew.CrewName}
        />
      )}
    </div>
  );
}
