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
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  DownloadIcon,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import { 
  DeductionType, 
  getDeductionGovtRates, 
  PHILHEALTHDeductionRate, 
  SSSDeductionRate 
} from "@/src/services/deduction/governmentDeduction.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSSSRateDialog } from "../dialogs/AddSSSRateDialog";
import { AddPhilhealthRateDialog } from "../dialogs/AddPhilhealthRateDialog";
import { EditSSSRateDialog } from "../dialogs/EditSSSRateDialog";
import { EditPhilHealthRateDialog } from "../dialogs/EditPhilhealthDialog";

export default function GovermentDeductions() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("PHILHEALTH");
  const [deductionType, setDeductionType] = useState<DeductionType>("PHILHEALTH");
  const [sssData, setSSSData] = useState<SSSDeductionRate[]>([]);
  const [philhealthData, setPhilhealthData] = useState<PHILHEALTHDeductionRate[]>([]);
  const [isAddSSSRateDialogOpen, setAddSSSRateDialogOpen] = useState(false);
  const [isAddPhilhealthRateDialogOpen, setAddPhilhealthRateDialogOpen] = useState(false);
  const [selectedSSSData , setSelectedSSSData] = useState<SSSDeductionRate | null>(null);
  const [editselectedSSSDialogOpen, setEditselectedSSSDialogOpen] = useState(false);
  const [selectedPhilHealthData , setSelectedPhilHealthData] = useState<PHILHEALTHDeductionRate | null>(null);
  const [editselectedPhilHealthDialogOpen, setEditselectedPhilHealthDialogOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );

  // Fetch data
  useEffect(() => {
    const validTypes: DeductionType[] = ["PHILHEALTH", "SSS"];
    if (!yearFilter || !deductionType || !validTypes.includes(deductionType as DeductionType)) return;

    const type = deductionType as DeductionType;

    getDeductionGovtRates(Number(yearFilter), type)
      .then((res) => {
        if (!res.success || !Array.isArray(res.data) || res.data.length === 0) {
          //console.warn("No data returned for", type, yearFilter);
          return;
        }
        if (type === "PHILHEALTH") {
          const mapped: PHILHEALTHDeductionRate[] = res.data.map((item: any) => ({
            contributionId: item.contributionID, // normalize id
            salaryFrom: item.salaryFrom,
            salaryTo: item.salaryTo,
            premium: item.premium,
            premiumRate: item.premiumRate,
            Year: item.Year,
          }));
          setPhilhealthData(mapped);

        } else if (type === "SSS") {
          const mapped: SSSDeductionRate[] = res.data.map((item: any) => ({
            contributionId: item.contributionId,
            salaryFrom: item.salaryFrom,
            salaryTo: item.salaryTo,
            regularSS: item.regularSS,
            mutualFund: item.mutualFund,
            eerate: item.eerate,
            errate: item.errate,
            erss: item.erss,
            ermf: item.ermf,
            ec: item.ec,
            eess: item.eess,
            eemf: item.eemf,
            ss: item.ss,
            mf: item.mf,
            Year: item.Year,
          }));
          setSSSData(mapped);
        }
      })
      .catch((err) => {
        console.error("Error fetching deduction rates:", err);
      });
  }, [yearFilter, deductionType]);
  
  const getDeductionColumns = (type: string): ColumnDef<any>[] => {
    if (type === "PHILHEALTH") {
      return [
        { accessorKey: "salaryFrom", header: "Salary From" },
        { accessorKey: "salaryTo", header: "Salary To" },
        { accessorKey: "premium", header: "Premium" },
        { accessorKey: "premiumRate", header: "Premium Rate (%)" },
        { accessorKey: "Year", header: "Year" },
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
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedPhilHealthData(row.original);
                      setEditselectedPhilHealthDialogOpen(true);
                    }}>
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit Deduction
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      ];
    }

    if (type === "SSS") {
      return [
        { accessorKey: "salaryFrom", header: "Salary From" },
        { accessorKey: "salaryTo", header: "Salary To" },
        { accessorKey: "eess", header: "Employee SS" },
        { accessorKey: "erss", header: "Employer SS" },
        { accessorKey: "eemf", header: "Employee Mutual Fund" },
        { accessorKey: "ermf", header: "Employer Mutual Fund" },
        { accessorKey: "ec", header: "EC" },
        { accessorKey: "Year", header: "Year" },
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
                <DropdownMenuItem
                  className="text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedSSSData(row.original);
                      setEditselectedSSSDialogOpen(true);
                    }}>
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Edit SSS Deduction
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      ];
    }

    return [];
  };

  const isValidDeductionType = (val: any): val is DeductionType =>
    val === "SSS" || val === "PHILHEALTH";

  // Safely get data
  const deductionGovtData = isValidDeductionType(deductionType)
    ? deductionType === "SSS"
      ? sssData
      : philhealthData
    : [];

  // Safely filter data by year
  const filteredDeductionGovtData = Array.isArray(deductionGovtData)
    ? deductionGovtData.filter(
        (item) =>
          typeof item?.Year !== "undefined" &&
          item.Year?.toString() === yearFilter.toString()
      )
    : [];

  // Safely get columns
  const columns = isValidDeductionType(deductionType)
    ? getDeductionColumns(deductionType)
    : [];

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "SSS" || value === "PHILHEALTH") {
      setDeductionType(value);
    }
  };

  const handleSSSDeductionUpdated = (updatedRate: SSSDeductionRate) => {
    setSSSData((prev) =>
      prev.map((item) =>
        item.contributionId === updatedRate.contributionId ? updatedRate : item
      )
    );
  };

  const handlePhilHealthDeductionUpdated = (updatedRate: PHILHEALTHDeductionRate) => {
    setPhilhealthData((prev) =>
      prev.map((item) =>
        item.contributionId === updatedRate.contributionId ? updatedRate : item
      )
    );
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
        <div className="p-3 pt-0 sm:p-4 flex flex-col space-y-4 sm:space-y-5 h-full">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">
              Government Deduction
            </h1>
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
                      value="PHILHEALTH"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      Philhealth
                    </TabsTrigger>
                    <TabsTrigger
                      value="SSS"
                      className="px-10 pb-8 h-full text-lg data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none cursor-pointer"
                    >
                      SSS
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent
                value="PHILHEALTH"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                    <div className="w-full md:w-auto">
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-[280px] min-w-[240px]">
                          <div className="flex items-center justify-between w-full -mx-4">
                            <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                              <span className="text-muted-foreground text-base">Select Year</span>
                            </div>
                            <span className="text-foreground text-base px-4">{yearFilter}</span>
                          </div>
                        </SelectTrigger>

                        <SelectContent className="w-[280px]">
                          {years.map((yr, idx) => (
                            <SelectItem key={idx} value={yr}>
                              {yr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end">
                      <Button
                        className="whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
                        size="default"
                        onClick={() => setAddPhilhealthRateDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />
                        Insert New Rate
                      </Button>
                    </div>
                  </div>

                  {/* DataTable with custom styling */}
                  <div className="bg-[#F9F9F9] rounded-md border pb-3">
                    <DataTable
                      columns={columns}
                      data={filteredDeductionGovtData}
                      pageSize={7}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="SSS"
                className="p-2 mt-0 overflow-y-auto flex-1"
              >
                <div className="p-3 sm:p-4 flex flex-col space-y-4 sm:space-y-5 min-h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                    <div className="w-full md:w-auto">
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-[280px] min-w-[240px]">
                          <div className="flex items-center justify-between w-full -mx-4">
                            <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                              <span className="text-muted-foreground text-base">Select Year</span>
                            </div>
                            <span className="text-foreground text-base px-4">{yearFilter}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="w-[280px]">
                          {years.map((yr, idx) => (
                            <SelectItem key={idx} value={yr}>
                              {yr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end">
                      <Button
                        className="whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
                        size="default"
                        onClick={() => setAddSSSRateDialogOpen(true)}
                      >
                        <Plus className="mr-1.5 sm:mr-2 h-4 sm:h-4.5 w-4 sm:w-4.5" />
                        Insert New Rate
                      </Button>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                          <DownloadIcon className="h-4 w-4" />
                          <span>Export</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">Export as Excel</SelectItem>
                          <SelectItem value="pdf">Export as PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* DataTable with custom styling */}
                  <div className="bg-[#F9F9F9] rounded-md border pb-3">
                    <DataTable
                      columns={columns}
                      data={filteredDeductionGovtData}
                      pageSize={7}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      <AddSSSRateDialog
        open={isAddSSSRateDialogOpen}
        onOpenChange={setAddSSSRateDialogOpen} 
          onSuccess={(newRate) => {
          setSSSData((prev) => [...prev, newRate]);
        }}    
        />

      <AddPhilhealthRateDialog
        open={isAddPhilhealthRateDialogOpen}
        onOpenChange={setAddPhilhealthRateDialogOpen} 
          onSuccess={(newRate) => {
          setPhilhealthData((prev) => [...prev, newRate]);
        }}
      />

        {selectedSSSData && editselectedSSSDialogOpen && (
          <EditSSSRateDialog
            open={editselectedSSSDialogOpen}
            onOpenChange={setEditselectedSSSDialogOpen}
            SSSvesselTypeData={selectedSSSData}
            onSuccess={handleSSSDeductionUpdated}
          />
        )}

        {selectedPhilHealthData && editselectedPhilHealthDialogOpen && (
          <EditPhilHealthRateDialog
            open={editselectedPhilHealthDialogOpen}
            onOpenChange={setEditselectedPhilHealthDialogOpen}
            PhilHealthvesselTypeData={selectedPhilHealthData}
            onSuccess={handlePhilHealthDeductionUpdated}
          />
        )}
    </div>
  );
}