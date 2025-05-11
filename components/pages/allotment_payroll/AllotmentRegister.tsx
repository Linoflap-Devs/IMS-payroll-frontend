"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";
import { getVesselAllotmentRegister } from "@/src/services/payroll/payroll.api";
import type { AllotmentRegister } from "@/src/services/payroll/payroll.api";
import { Ship } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AllotteeDistributionDialog } from "../../dialogs/AllotteeDistributionDialog";

interface VesselInfo {
  code: string;
  name: string;
  type: string;
  principalName: string;
}

export default function AllotmentRegisterComponent({
  vesselInfo,
}: {
  vesselInfo?: VesselInfo;
}) {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("vesselId");
  const [searchTerm, setSearchTerm] = useState("");
  const [allotmentData, setAllotmentData] = useState<AllotmentRegister[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<AllotmentRegister | null>(
    null
  );
  const [isAllotteeDialogOpen, setIsAllotteeDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAllotmentData = async () => {
      if (!vesselId) return;

      setIsLoading(true);
      try {
        const response = await getVesselAllotmentRegister(vesselId);
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
  }, [vesselId]);

  // Format numbers to two decimal places with null checking
  const formatNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const columns: ColumnDef<AllotmentRegister>[] = [
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
                }}
              >
                View Allottee Distribution
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData = allotmentData.filter((item) =>
    item.CrewName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                className="mt-2 px-6 py-0 bg-[#DFEFFE] text-[#292F8C]"
              >
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
            <Button className="gap-2 h-11 px-5">
              <AiOutlinePrinter className="h-4 w-4" />
              Print Register
            </Button>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          <DataTable columns={columns} data={filteredData} pageSize={6} />
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
