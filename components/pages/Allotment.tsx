"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";
import { getPayrollList } from "@/src/services/payroll/payroll.api";
import { getDashboardList } from "@/src/services/dashboard/dashboard.api";
import { TfiReload } from "react-icons/tfi";
import { MdOutlineFileUpload } from "react-icons/md";

type Payroll = {
  vesselId: number;
  vesselName: string;
  onBoardCrew: number;
  grossAllotment: number;
  totalDeductions: number;
  netAllotment: number;
};

export default function Allotment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [forexRate, setForexRate] = useState<number>(0); // State for Forex rate
  const [monthFilter, setMonthFilter] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );

  // Format numbers to two decimal places
  const formatNumber = (value: number) => value.toFixed(2);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardResponse = await getDashboardList();
        if (dashboardResponse.success && dashboardResponse.data) {
          setForexRate(dashboardResponse.data.ForexRate);
        } else {
          console.error(
            "Failed to fetch dashboard data:",
            dashboardResponse.message
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();

    getPayrollList()
      .then((res) => {
        if (res.success) {
          const mapped: Payroll[] = res.data.map((item) => ({
            vesselId: item.VesselId,
            vesselName: item.VesselName,
            onBoardCrew: item.OnBoardCrew,
            grossAllotment: item.GrossAllotment,
            totalDeductions: item.TotalDeduction,
            netAllotment: item.NetAllotment,
          }));
          setPayrollData(mapped);
        } else {
          console.error("Failed to fetch payroll list:", res.message);
        }
      })
      .catch((err) => console.error("Error fetching payroll list:", err));
  }, []);

  // Calculate totals
  const totalGross = payrollData.reduce((sum, p) => sum + p.grossAllotment, 0);
  const totalDeduction = payrollData.reduce(
    (sum, p) => sum + p.totalDeductions,
    0
  );
  const totalNet = payrollData.reduce((sum, p) => sum + p.netAllotment, 0);

  const columns: ColumnDef<Payroll>[] = [
    {
      accessorKey: "vesselName",
      header: "Vessel Name",
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {row.getValue("vesselName")}
        </div>
      ),
    },
    {
      accessorKey: "onBoardCrew",
      header: "On Board Crew",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {row.getValue("onBoardCrew")}
        </div>
      ),
    },
    {
      accessorKey: "grossAllotment",
      header: "Gross Allotment",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {formatNumber(Number(row.getValue("grossAllotment")))}
        </div>
      ),
    },
    {
      accessorKey: "totalDeductions",
      header: "Total Deductions",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {formatNumber(Number(row.getValue("totalDeductions")))}
        </div>
      ),
    },
    {
      accessorKey: "netAllotment",
      header: "Net Allotment",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {formatNumber(Number(row.getValue("netAllotment")))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs sm:text-sm">
              <DropdownMenuItem asChild>
                <Link
                  href={`/home/allotment/allotment_register?vesselId=${row.original.vesselId}`}
                >
                  Allotment Register
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/home/allotment/deduction_register?vesselId=${
                    row.original.vesselId
                  }&month=${parseInt(monthFilter)}&year=${parseInt(
                    yearFilter
                  )}`}
                >
                  Deduction Register
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/home/allotment/payslip?vesselId=${
                    row.original.vesselId
                  }&month=${parseInt(monthFilter)}&year=${parseInt(
                    yearFilter
                  )}`}
                >
                  Pay Slip
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredAllotment = payrollData.filter((p) =>
    p.vesselName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full p-4 pt-2">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Allotment Payroll</h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 items-start sm:items-center gap-3 sm:gap-4 w-full">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[220px] w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full -mx-4">
                    <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                      <span className="text-muted-foreground text-base">
                        Month
                      </span>
                    </div>
                    <span className="text-foreground text-base px-4">
                      {monthNames[parseInt(monthFilter, 10) - 1]}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, idx) => (
                    <SelectItem key={idx} value={(idx + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[220px] w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full -mx-4">
                    <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                      <span className="text-muted-foreground text-base">
                        Year
                      </span>
                    </div>
                    <span className="text-foreground text-base px-4">
                      {yearFilter}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {years.map((yr, idx) => (
                    <SelectItem key={idx} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="bg-gray-200 text-gray-700 h-9 sm:h-10 px-8 sm:px-6 text-xs sm:text-sm w-full">
                <TfiReload className="w-4 h-4" />
                Process Vessel
              </Button>

              <Button
                variant="outline"
                className="bg-blue-200 text-blue-900 h-9 sm:h-10 px-8 sm:px-6 text-xs sm:text-sm w-full"
              >
                <MdOutlineFileUpload className="w-4 h-4" />
                Post Process Payroll
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="whitespace-nowrap h-9 sm:h-10 px-8 sm:px-6 text-xs sm:text-sm w-full">
                    <AiOutlinePrinter className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />
                    Print Summary
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                  <DropdownMenuItem asChild>
                    <Link href="/">Allotment Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">Deduction Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">Allotment/Payslip</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Exchange rate of USD</p>
                <h3 className="text-3xl font-bold self-end mt-4">
                  {formatNumber(forexRate)}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Total Gross Allotment</p>
                <h3 className="text-3xl font-bold self-end mt-4">
                  {formatNumber(totalGross)}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Total Deduction</p>
                <h3 className="text-3xl font-bold self-end mt-4">
                  {formatNumber(totalDeduction)}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Total Net Allotment</p>
                <h3 className="text-3xl font-bold self-end mt-4">
                  {formatNumber(totalNet)}
                </h3>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-md border pb-3">
            <DataTable
              columns={columns}
              data={filteredAllotment}
              pageSize={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
