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
import { getVesselDeductionRegister } from "@/src/services/payroll/payroll.api";
import type {
  DeductionRegisterCrew,
  DeductionRegisterData,
} from "@/src/services/payroll/payroll.api";
import { Ship } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeductionDistributionDialog } from "../../dialogs/DeductionDistributionDialog";
import { useDebounce } from "@/lib/useDebounce";
import { generateDeductionAllotmentV2PDF } from "@/components/PDFs/payrollDeductionRegisterV2PDF";
import { generateDeductionAllotmentExcel } from "@/components/Excels/payrollDeductionRegister";
import { PiReceiptFill } from "react-icons/pi";

export default function DeductionRegisterComponent() {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("vesselId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [allotmentData, setAllotmentData] = useState<DeductionRegisterData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] =
    useState<DeductionRegisterCrew | null>(null);
  const [isDeductionDialogOpen, setIsDeductionDialogOpen] = useState(false);

  const forex = searchParams.get("forex");
  useEffect(() => {
    const fetchAllotmentData = async () => {
      if (!vesselId || !month || !year) return;

      setIsLoading(true);
      try {
        const response = await getVesselDeductionRegister(
          vesselId,
          parseInt(month),
          parseInt(year)
        );
        if (response.success) {
          setAllotmentData(response.data);
        }
      } catch (error) {
        console.error("Error fetching allotment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllotmentData();
  }, [vesselId, month, year]);

  // Format numbers to two decimal places with null checking
  const formatNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue?.toFixed(2);
  };

  const columns: ColumnDef<DeductionRegisterCrew>[] = [
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
      accessorKey: "Salary",
      header: "Salary",
      cell: ({ row }) => (
        <div className="text-right">{formatNumber(row.getValue("Salary"))}</div>
      ),
    },
    {
      accessorKey: "Allotment",
      header: "Allotment",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("Allotment"))}
        </div>
      ),
    },
    {
      accessorKey: "Gross",
      header: "Gross",
      cell: ({ row }) => (
        <div className="text-right">{formatNumber(row.getValue("Gross"))}</div>
      ),
    },
    {
      accessorKey: "Deduction",
      header: "Deduction",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("Deduction"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
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
                  setIsDeductionDialogOpen(true);
                }}>
              <PiReceiptFill className="mr-2 h-4 w-4" />
                View Deduction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filterCrew = allotmentData[0]?.Crew || [];
  const filteredData = filterCrew.filter((item) =>
    item.CrewName?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handlePrint = () => {
    generateDeductionAllotmentV2PDF(
      allotmentData,
      Number(month),
      Number(year),
      Number(forex)
    );
  };

  const handleExcelPrint = () => (
    generateDeductionAllotmentExcel(
      allotmentData, 
      Number(month),
      Number(year),
      Number(forex)
    )
  )

  return (
    <div className="h-full w-full p-6 pt-5 overflow-hidden">
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
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2">
          <Link href="/home/allotment">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold mb-0">Deduction Register</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Vessel Info Card */}
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {allotmentData[0]?.VesselCode}
              </div>
              <h2 className="text-2xl font-semibold">
                {allotmentData[0]?.VesselName}
              </h2>
              <Badge
                variant="secondary"
                className="mt-2 px-6 py-0 bg-[#DFEFFE] text-[#292F8C]">
                Active
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg flex items-center gap-2">
                <Ship className="h-4 w-4" />
                {allotmentData[0]?.VesselType}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm text-center">
                  <p className="flex items-center justify-center font-semibold">
                    {allotmentData[0]?.Principal}
                  </p>
                  <div className="text-gray-500 text-xs flex items-center justify-center">
                    Principal Name
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Search and Actions */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-10 px-4 text-sm" disabled={isLoading}>
                  <AiOutlinePrinter className="mr-2 h-4 w-4" />
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Print Summary"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-sm w-48">
                <DropdownMenuItem onClick={handlePrint}>
                  <AiOutlinePrinter className="mr-2 h-4 w-4" />
                    Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                onClick={handleExcelPrint}
                >
                  <AiOutlinePrinter className="mr-2 h-4 w-4" />
                  Export Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          <DataTable columns={columns} data={filteredData} pageSize={6} />
        </div>
      </div>

      {selectedCrew && (
        <DeductionDistributionDialog
          open={isDeductionDialogOpen}
          onOpenChange={setIsDeductionDialogOpen}
          deductions={selectedCrew.Deductions}
          crewName={selectedCrew.CrewName}
        />
      )}
    </div>
  );
}
