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
import { getVesselDeductionRegister } from "@/src/services/payroll/payroll.api";
import type { DeductionRegister } from "@/src/services/payroll/payroll.api";
import { Ship } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeductionDistributionDialog } from "../../dialogs/DeductionDistributionDialog";
import { getVesselList } from "@/src/services/vessel/vessel.api";

interface VesselInfo {
  code: string;
  name: string;
  type: string;
  principalName: string;
}

export default function DeductionRegisterComponent({
  vesselInfo: initialVesselInfo,
}: {
  vesselInfo?: VesselInfo;
}) {
  const searchParams = useSearchParams();
  const vesselId = searchParams.get("vesselId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const [searchTerm, setSearchTerm] = useState("");
  const [allotmentData, setAllotmentData] = useState<DeductionRegister[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<DeductionRegister | null>(
    null
  );
  const [isDeductionDialogOpen, setIsDeductionDialogOpen] = useState(false);
  const [vesselInfo, setVesselInfo] = useState<VesselInfo | undefined>(
    initialVesselInfo
  );

  useEffect(() => {
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
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const columns: ColumnDef<DeductionRegister>[] = [
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
                View Deduction
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
            <Button className="gap-2 h-11 px-5" disabled={isLoading}>
              <AiOutlinePrinter className="h-4 w-4" />
              Print Register
            </Button>
          </div>
        </div>

        {/* Allotment Table */}
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
