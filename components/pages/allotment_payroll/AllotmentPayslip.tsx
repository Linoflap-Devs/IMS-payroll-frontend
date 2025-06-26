"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {} from "@/components/ui/dropdown-menu";
import { Search, Filter, Ship, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";
import {
  CrewPayroll,
  getVesselPayslipV2,
  PayslipData,
} from "@/src/services/payroll/payroll.api";
import { useSearchParams } from "next/navigation";
import { generatePayrollPDF } from "@/components/PDFs/payrollStatementPDF";
import { toast } from "@/components/ui/use-toast";

export default function VesselPayslip() {
  const [searchTerm, setSearchTerm] = useState("");
  const [payslipData, setPayslipData] = useState<PayslipData>();
  const searchParams = useSearchParams();
  const [PayslipPDFData, setPayslipPDFData] = useState<PayslipData>();
  const [payslipCrewData, setPayslipCrewData] = useState<CrewPayroll[]>([]);

  useEffect(() => {
    const vesselId = searchParams.get("vesselId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (vesselId && month && year) {
      getVesselPayslipV2(vesselId, parseInt(month), parseInt(year))
        .then((res) => {
          if (res.success) {
            setPayslipPDFData(res.data);
            setPayslipData(res.data);
            setPayslipCrewData(res.data.vessels[0]?.payrolls || []);
          } else {
            console.error("Failed to fetch payslip data:", res.message);
          }
        })
        .catch((err) => console.error("Error fetching payslip data:", err));
    }
  }, [searchParams]);

  console.log("Payslip Data:", payslipData);
  console.log("Payslip Crew Data:", payslipCrewData);

  const columns: ColumnDef<CrewPayroll>[] = [
    {
      accessorKey: "crewCode",
      header: "Crew Code",
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {row.getValue("crewCode")}
        </div>
      ),
    },
    {
      accessorKey: "crewName",
      header: "Crew Name",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("crewName")}
        </div>
      ),
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("rank")}
        </div>
      ),
    },
  ];

  const filteredCrew = payslipCrewData.filter(
    (crew) =>
      crew.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crew.crewCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePayrollPDFs = () => {
    if (!PayslipPDFData) {
      console.error("No payslip data available for PDF generation.");
      toast({
        title: "Error",
        description: "No payslip data available for PDF generation.",
        variant: "destructive",
      });
      return;
    }
    generatePayrollPDF(PayslipPDFData);
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
      `}</style>
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2">
          <Link href="/home/allotment">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold mb-0">Allotment Payslip</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-6 bg-[#F5F6F7]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xl text-gray-500 uppercase">
                {payslipData?.vessels[0]?.vesselCode || "N/A"}
              </div>
              <h2 className="text-2xl font-semibold">
                {payslipData?.vessels[0]?.vesselName || "N/A"}
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
                {payslipData?.vessels[0].vesselType || "Bulk Jap, Flag"}
              </div>
              <Card className="p-1 bg-[#FDFDFD] mt-2">
                <div className="text-sm text-center">
                  <p className="flex items-center justify-center font-semibold">
                    {payslipData?.vessels[0]?.principal || "Iino Marine"}
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
            <Button variant="outline" className="gap-2 h-11 px-5">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="gap-2 h-11 px-5" onClick={generatePayrollPDFs}>
              <AiOutlinePrinter className="h-4 w-4" />
              Print Payslip
            </Button>
          </div>
        </div>

        <div className="rounded-md border pb-3">
          <DataTable columns={columns} data={filteredCrew} pageSize={6} />
        </div>
      </div>
    </div>
  );
}
