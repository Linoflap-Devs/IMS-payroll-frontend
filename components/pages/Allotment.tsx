"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";

// Sample vessel allotment data
const vesselAllotment = [
  {
    vesselName: "Vessel A",
    onBoardCrew: 10,
    grossAllotment: 5000,
    totalDeductions: 2000,
    netAllotment: 3000,
  },
  {
    vesselName: "Vessel B",
    onBoardCrew: 15,
    grossAllotment: 7000,
    totalDeductions: 2500,
    netAllotment: 4500,
  },
  {
    vesselName: "Vessel C",
    onBoardCrew: 8,
    grossAllotment: 4000,
    totalDeductions: 1500,
    netAllotment: 2500,
  },
  {
    vesselName: "Vessel D",
    onBoardCrew: 12,
    grossAllotment: 6000,
    totalDeductions: 3000,
    netAllotment: 3000,
  },
  {
    vesselName: "Vessel E",
    onBoardCrew: 20,
    grossAllotment: 8000,
    totalDeductions: 3500,
    netAllotment: 4500,
  },
  {
    vesselName: "Vessel F",
    onBoardCrew: 5,
    grossAllotment: 3000,
    totalDeductions: 1000,
    netAllotment: 2000,
  },
  {
    vesselName: "Vessel G",
    onBoardCrew: 18,
    grossAllotment: 9000,
    totalDeductions: 4000,
    netAllotment: 5000,
  },
  {
    vesselName: "Vessel H",
    onBoardCrew: 25,
    grossAllotment: 10000,
    totalDeductions: 5000,
    netAllotment: 5000,
  },
  {
    vesselName: "Vessel I",
    onBoardCrew: 30,
    grossAllotment: 12000,
    totalDeductions: 6000,
    netAllotment: 6000,
  },
  {
    vesselName: "Vessel J",
    onBoardCrew: 22,
    grossAllotment: 11000,
    totalDeductions: 5500,
    netAllotment: 5500,
  },
  // Add more vessel data as needed
];

type Vessel = (typeof vesselAllotment)[number];

const columns: ColumnDef<Vessel>[] = [
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
        {row.getValue("grossAllotment")}
      </div>
    ),
  },
  {
    accessorKey: "totalDeductions",
    header: "Total Deductions",
    cell: ({ row }) => (
      <div className="text-xs sm:text-sm text-center">
        {row.getValue("totalDeductions")}
      </div>
    ),
  },
  {
    accessorKey: "netAllotment",
    header: "Net Allotment",
    cell: ({ row }) => (
      <div className="text-xs sm:text-sm text-center">
        {row.getValue("netAllotment")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
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
                <Link href={`/`}>
                  <AiOutlinePrinter className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Register
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/`}>
                  <AiOutlinePrinter className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Deduction
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/`}>
                  <AiOutlinePrinter className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Payslip
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function Allotment() {
  const [searchTerm, setSearchTerm] = useState("");
  // Use separate state variables for month and year
  const [monthFilter, setMonthFilter] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );

  // List of month names for display
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

  // Generate a list of year options (adjust the range as needed)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

  // Dummy filtering based on search term (update if your data includes date fields)
  const filteredAllotment = vesselAllotment.filter((vessel) => {
    const matchesSearch = vessel.vesselName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="h-full w-full p-4 pt-2">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Allotment</h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
              <Input
                placeholder="Search vessel by name..."
                className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
              {/* Month Filter */}
              <Select
                value={monthFilter}
                onValueChange={(value) => setMonthFilter(value)}
              >
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
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={yearFilter}
                onValueChange={(value) => setYearFilter(value)}
              >
                <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[220px] w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full -mx-4 p">
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
                  {years.map((yr, index) => (
                    <SelectItem key={index} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="whitespace-nowrap h-9 sm:h-10 px-8 sm:px-6 text-xs sm:text-sm w-full sm:w-auto"
                    size="default"
                  >
                    <AiOutlinePrinter className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />
                    Print Summary
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                  <DropdownMenuItem asChild>
                    <Link href={`/`}>Allotment Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/`}>Deduction Register</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/`}>Allotment/Payslip</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Exchange rate of USD</p>
                <h3 className="text-3xl font-bold self-end mt-4">123</h3>
              </CardContent>
            </Card>

            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-10">
                <p className="text-xl pt-0">Total Gross Allotment</p>
                <h3 className="text-3xl font-bold self-end mt-4">5149</h3>
              </CardContent>
            </Card>

            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Total Deduction</p>
                <h3 className="text-3xl font-bold self-end mt-4">3249</h3>
              </CardContent>
            </Card>

            <Card className="bg-blue-800 text-white py-3">
              <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                <p className="text-xl pt-0">Total Net Allotment</p>
                <h3 className="text-3xl font-bold self-end mt-4">3249</h3>
              </CardContent>
            </Card>
          </div>

          {/* DataTable */}
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
