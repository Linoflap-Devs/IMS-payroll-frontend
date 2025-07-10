"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CircleAlert, Loader2, MoreHorizontal, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "../ui/card";
import { AiOutlinePrinter } from "react-icons/ai";
import {
  AllotmentRegisterData,
  getForex,
  getPayrollList,
  getVesselAllotmentRegister,
  getVesselDeductionRegister,
  getVesselPayslipV2,
  PayslipData,
  postPayrolls,
  postVesselPayrolls,
} from "@/src/services/payroll/payroll.api";
import { getDashboardList } from "@/src/services/dashboard/dashboard.api";
import { MdFileUpload, MdOutlineFileUpload } from "react-icons/md";
import { useDebounce } from "@/lib/useDebounce";
import { toast } from "../ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { generateAllotmentPDF } from "../PDFs/payrollAllotmentRegisterPDF";
import { DeductionRegisterData } from "../PDFs/allotmentDeductionRegister";
import { generatePayrollPDF } from "../PDFs/payrollStatementPDF";
import { PiFileTextFill, PiReceiptFill, PiUserListFill } from "react-icons/pi";
import { generateDeductionAllotmentV2PDF } from "../PDFs/payrollDeductionRegisterV2PDF";
import { generateAllotmentExcel } from "../Excels/allotmentAllotmentRegister";
import { generateDeductionAllotmentExcel } from "../Excels/payrollDeductionRegister";
import { generatePayrollExcel } from "../Excels/payrollStatementPDF";

type Payroll = {
  vesselId: number;
  vesselName: string;
  onBoardCrew: number;
  grossAllotment: number;
  totalDeductions: number;
  netAllotment: number;
};

// Skeleton component for the cards
const CardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="bg-blue-800 text-white py-3">
          <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
            <Skeleton className="h-6 w-3/4 bg-blue-700" />
            <div className="flex justify-between w-full">
              <Skeleton className="h-8 w-[10%] bg-blue-700" />
              <Skeleton className="h-8 w-[50%] bg-blue-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Table skeleton component
const TableSkeleton = () => {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex py-3 bg-gray-50 border-b">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex-1 px-3 text-center">
            <Skeleton className="h-6 w-[80%] mx-auto" />
          </div>
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: 7 }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex py-4 border-b">
          {Array.from({ length: 6 }).map((_, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className="flex-1 px-3 text-center"
            >
              <Skeleton className="h-5 w-[80%] mx-auto" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function Allotment() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [forexRate, setForexRate] = useState<number>(0);
  const [monthFilter, setMonthFilter] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );

  //loading states
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Payroll | null>(null);

  const formatNumber = (value: number) => value?.toFixed(2);

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
  const years = Array.from({ length: 20 }, (_, i) =>
    (currentYear - 15 + i).toString()
  );

  const [allotmentRegisterData, setAllotmentRegisterData] = useState<
    AllotmentRegisterData[]
  >([]);

  const [allotmentDeductionData, setAllotmentDeductionData] = useState<
    DeductionRegisterData[]
  >([]);

  const [allotmentPayslipData, setAllotmentPayslipData] =
    useState<PayslipData>();

  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const vesselId = searchParams.get("vesselId");

  useEffect(() => {
    // getVesselAllotmentRegister(
    //   vesselId ? vesselId : null,
    //   month ? parseInt(month) : null,
    //   year ? parseInt(year) : null
    // )
    //   .then((response) => {
    //     if (response.success && Array.isArray(response.data)) {
    //       setAllotmentRegisterData(response.data);
    //     } else {
    //       console.log("Unexpected API response format:", response);
    //       setAllotmentRegisterData([]);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching allotment register data:", error);
    //     setAllotmentRegisterData([]);
    //   });
  }, [vesselId, month, year]);

  useEffect(() => {
    // getVesselDeductionRegister(
    //   vesselId ? vesselId : null,
    //   month ? parseInt(month) : null,
    //   year ? parseInt(year) : null
    // )
    //   .then((response) => {
    //     if (response.success && Array.isArray(response.data)) {
    //       setAllotmentDeductionData(response.data);
    //     } else {
    //       console.log("Unexpected API response format:", response);
    //       setAllotmentRegisterData([]);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching deduction register data:", error);
    //     setAllotmentRegisterData([]);
    //   });
  }, [vesselId, month, year]);

  useEffect(() => {
    // getVesselPayslipV2(
    //   vesselId ? vesselId : null,
    //   month ? parseInt(month) : null,
    //   year ? parseInt(year) : null
    // )
    //   .then((response) => {
    //     if (response.success) {
    //       setAllotmentPayslipData(response.data);
    //     } else {
    //       toast({
    //         title: "Error",
    //         description: "Failed to fetch payslip data.",
    //         variant: "destructive",
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching payslip data:", error);
    //   });
  }, [vesselId, month, year]);

  // Fetch data when filters change
  useEffect(() => {
    setIsDataLoading(true);

    const fetchDashboardData = async () => {
      try {
        //const dashboardResponse = await getDashboardList();
        const forexRate = await getForex(monthFilter, yearFilter);
        console.log("Forex rate", forexRate);

        console.log("Filters: ", monthFilter, yearFilter);
        console.log(
          "Result",
          forexRate.find(
            (item) =>
              item.ExchangeRateMonth === Number(monthFilter) &&
              item.ExchangeRateYear === Number(yearFilter)
          )
        );
        if (forexRate.length > 0) {
          const result = forexRate.find(
            (item) =>
              item.ExchangeRateMonth === Number(monthFilter) &&
              item.ExchangeRateYear === Number(yearFilter)
          );
          setForexRate(result?.ExchangeRate || 0);
        }
        // if (dashboardResponse.success && dashboardResponse.data) {
        //   //setForexRate(dashboardResponse.data.ForexRate);
        // } else {
        //   console.error(
        //     "Failed to fetch dashboard data:",
        //     dashboardResponse.message
        //   );
        // }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    // fetchDashboardData();

    // getPayrollList(Number(monthFilter), Number(yearFilter))
    //   .then((res) => {
    //     if (res.success) {
    //       const mapped: Payroll[] = res.data.map((item) => ({
    //         vesselId: item.VesselId,
    //         vesselName: item.VesselName,
    //         onBoardCrew: item.OnBoardCrew,
    //         grossAllotment: item.GrossAllotment,
    //         totalDeductions: item.TotalDeduction,
    //         netAllotment: item.NetAllotment,
    //       }));

    //       setPayrollData(mapped);
    //     } else {
    //       console.error("Failed to fetch payroll list:", res.message);
    //     }
    //   })
    //   .catch((err) => console.error("Error fetching payroll list:", err))

    const fetchPayrollData = async () => {
      try {
        const res = await getPayrollList(
          Number(monthFilter),
          Number(yearFilter)
        );
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
      } catch (err) {
        console.error("Error fetching payroll list:", err);
      }
    };

    Promise.all([fetchDashboardData(), fetchPayrollData()]).finally(() => {
      setIsDataLoading(false);
    });
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthFilter);
    params.set("year", yearFilter);

    router.push(`${pathname}?${params.toString()}`);
  }, [monthFilter, yearFilter, pathname, searchParams, router]);

  const totalGross = payrollData.reduce((sum, p) => sum + p.grossAllotment, 0);
  const totalDeduction = payrollData.reduce(
    (sum, p) => sum + p.totalDeductions,
    0
  );
  const totalNet = payrollData.reduce((sum, p) => sum + p.netAllotment, 0);

  const handleProcessPayroll = async () => {
    setPayrollLoading(true);

    try {
      const response = await postPayrolls(monthFilter, Number(yearFilter));

      const wasAllAlreadyPosted = response.message?.includes("Posted 0");

      if (response.success) {
        toast({
          title: wasAllAlreadyPosted ? "Nothing to Post" : "Payroll Processed",
          description:
            response.message ||
            `Payroll for ${
              monthNames[parseInt(monthFilter) - 1]
            } ${yearFilter} has been processed successfully.`,
          variant: wasAllAlreadyPosted ? "default" : "success",
        });
      } else {
        toast({
          title: "Payroll Not Processed",
          description:
            response.message ||
            "Something went wrong while processing the payroll.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast({
        title: "Error Processing Payroll",
        description: "An error occurred while processing the payroll.",
        variant: "destructive",
      });
    } finally {
      setPayrollLoading(false);
    }
  };

  const handlePostVesselPayroll = async (selectedVessel: Payroll) => {
    if (!selectedVessel || !selectedVessel.vesselId) {
      toast({
        title: "Missing Vessel",
        description: "Please select a vessel before posting payroll.",
        variant: "destructive",
      });
      return;
    }

    setPayrollLoading(true);

    try {
      const response = await postVesselPayrolls(
        monthFilter,
        yearFilter,
        selectedVessel.vesselId
      );

      const wasAllAlreadyPosted = response.message?.includes("Posted 0");

      if (response.success) {
        toast({
          title: wasAllAlreadyPosted
            ? "Payroll has already been posted."
            : "Payroll Processed",
          description:
            response.message || "Payroll has been processed successfully.",
          variant: wasAllAlreadyPosted ? "default" : "success",
        });
      } else {
        toast({
          title: "Payroll Not Processed",
          description:
            response.message ||
            "Something went wrong while processing the payroll.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast({
        title: "Error Processing Payroll",
        description: "An error occurred while processing the payroll.",
        variant: "destructive",
      });
    } finally {
      setPayrollLoading(false);
    }
  };

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
          {new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(Number(row.getValue("grossAllotment")))}
        </div>
      ),
    },
    {
      accessorKey: "totalDeductions",
      header: "Total Deductions",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(Number(row.getValue("totalDeductions")))}
        </div>
      ),
    },
    {
      accessorKey: "netAllotment",
      header: "Net Allotment",
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm text-center">
          {new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(Number(row.getValue("netAllotment")))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
                href={`/home/allotment/allotment_register?vesselId=${
                  row.original.vesselId
                }&month=${parseInt(monthFilter)}&year=${parseInt(
                  yearFilter
                )}&forex=${forexRate || 0}`}
              >
                <PiUserListFill className="mr-2 h-4 w-4" />
                Allotment Register
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`/home/allotment/deduction_register?vesselId=${
                  row.original.vesselId
                }&month=${parseInt(monthFilter)}&year=${parseInt(
                  yearFilter
                )}&forex=${forexRate || 0}`}
              >
                <PiReceiptFill className="mr-2 h-4 w-4" />
                Deduction Register
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`/home/allotment/payslip?vesselId=${
                  row.original.vesselId
                }&month=${parseInt(monthFilter)}&year=${parseInt(
                  yearFilter
                )}&forex=${forexRate || 0}`}
              >
                <PiFileTextFill className="mr-2 h-4 w-4" />
                Pay Slip
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectedVessel(row.original);
                setShowPostDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <MdFileUpload className="text-[#62748e] mr-2 h-4 w-4" />
              Post Payroll
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredAllotment = payrollData.filter((p) =>
    p.vesselName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleGenerateAllotmentRegisterPDF = async () => {
    setIsDataLoading(true)
    const response = await getVesselAllotmentRegister(
      vesselId ? vesselId : null,
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    )
      // .then((response) => {
      //   if (response.success && Array.isArray(response.data)) {
      //     setAllotmentRegisterData(response.data);
      //   } else {
      //     console.log("Unexpected API response format:", response);
      //     setAllotmentRegisterData([]);
      //   }
      // })
      // .catch((error) => {
      //   console.error("Error fetching allotment register data:", error);
      //   setAllotmentRegisterData([]);
      // });

      const monthNames = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];

    await generateAllotmentPDF(
        response.data,
        monthNames[Number(month)] ? monthNames[Number(month) - 1] : "ALL",
        year ? parseInt(year) : new Date().getFullYear(),
        Number(forexRate)
      );
    setIsDataLoading(false)

    // if (allotmentRegisterData && allotmentRegisterData.length > 0) {
    //   // Get month name from month number
     

    //   // const monthName = monthNames[selectedMonth - 1];

      
    // } else {
    //   console.error("No allotment register data available");
    // }
  };

  const handleGenerateDeductionRegisterPDF = async () => {
    setIsDataLoading(true)
    const response = await getVesselDeductionRegister(
      vesselId ? vesselId : null,
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    )
      // .then((response) => {
      //   if (response.success && Array.isArray(response.data)) {
      //     setAllotmentDeductionData(response.data);
      //   } else {
      //     console.log("Unexpected API response format:", response);
      //     setAllotmentRegisterData([]);
      //   }
      // })
      // .catch((error) => {
      //   console.error("Error fetching deduction register data:", error);
      //   setAllotmentRegisterData([]);
      // });

    generateDeductionAllotmentV2PDF(
      response.data,
      Number(month),
      Number(year),
      Number(forexRate),
    )
    setIsDataLoading(false)
  };

  const handleGeneratePayslipPDF = async () => {
    setIsDataLoading(true)
    const response = await getVesselPayslipV2(
      vesselId ? vesselId : null,
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    )

    generatePayrollPDF(
      response.data,
      undefined,
      vesselId ? parseInt(vesselId) : undefined
    );
    setIsDataLoading(false)
  };

  // EXCEL
  const handleGenerateAllotmentRegisterExcel = () => {
    if (allotmentRegisterData && allotmentRegisterData.length > 0) {
      const monthNames = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
      ];

      generateAllotmentExcel(
        allotmentRegisterData,
        monthNames[Number(month)] ? monthNames[Number(month) - 1] : "ALL",
        year ? parseInt(year) : new Date().getFullYear(),
        Number(forexRate)
      );
    } else {
      console.error("No allotment register data available");
    }
  };

  const handleGenerateDeductionRegisterExcel = () => {
    generateDeductionAllotmentExcel(
      allotmentDeductionData,
      Number(month),
      Number(year),
      Number(forexRate)
    );
  };

  const handleGeneratePayslipExcel = () => {
    if (!allotmentPayslipData) {
      console.error("No payslip data available for PDF generation.");
      return;
    }
    generatePayrollExcel(
      allotmentPayslipData,
      undefined,
      vesselId ? parseInt(vesselId) : undefined
    );
  };

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
            <div className="grid grid-cols-6 items-center gap-3 sm:gap-4 w-full">
              {/* Month Filter */}
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="bg-white h-full sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[220px] w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full -mx-4">
                    <div className="flex items-center h-full bg-[#F6F6F6] py-2.5 px-4 border-r rounded-l-md">
                      <span className="text-muted-foreground text-base">
                        Month
                      </span>
                    </div>
                    <span className="text-foreground text-base px-4">
                      {monthNames[Number(monthFilter) - 1]}
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

              {/* Year Filter */}
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
                <SelectContent className="max-h-92 overflow-y-auto">
                  {years.map((yr, idx) => (
                    <SelectItem key={idx} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div></div>
              {/* Process Payroll Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-blue-200 hover:bg-blue-300 text-blue-900 h-10 px-6 text-sm"
                    disabled={payrollLoading || isDataLoading}
                  >
                    {payrollLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MdOutlineFileUpload className="w-4 h-4" />
                        Post Process Payrolls
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white p-10">
                  <AlertDialogHeader className="flex items-center">
                    <CircleAlert size={120} strokeWidth={1} color="orange" />
                    <AlertDialogTitle className="text-3xl">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-md">
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex items-center justify-center space-x-4 px-4">
                    <AlertDialogCancel className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white">
                      No, Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="w-1/2 bg-red-500 hover:bg-red-600 text-white"
                      onClick={handleProcessPayroll}
                      disabled={payrollLoading}
                    >
                      {payrollLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Yes, Process Payroll"
                      )}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>

              {/* PDF Summary Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-10 px-4 text-sm"
                    disabled={printLoading || isDataLoading}
                  >
                    <AiOutlinePrinter className="mr-2 h-4 w-4" />
                    {printLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Printing...
                      </>
                    ) : (
                      "PDF Summary"
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-sm w-48">
                  <DropdownMenuItem
                    onClick={handleGenerateAllotmentRegisterPDF}
                  >
                    <PiUserListFill className="mr-2 h-4 w-4" />
                    Allotment Register
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleGenerateDeductionRegisterPDF}
                  >
                    <PiReceiptFill className="mr-2 h-4 w-4" />
                    Deduction Register
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGeneratePayslipPDF}>
                    <PiFileTextFill className="mr-2 h-4 w-4" />
                    Allotment / Payslip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Excel Summary Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-10 px-4 text-sm"
                    disabled={printLoading || isDataLoading}
                  >
                    <AiOutlinePrinter className="mr-2 h-4 w-4" />
                    {printLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Printing...
                      </>
                    ) : (
                      "Excel Summary"
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-sm w-48">
                  <DropdownMenuItem
                    onClick={handleGenerateAllotmentRegisterExcel}
                  >
                    <PiUserListFill className="mr-2 h-4 w-4" />
                    Allotment Register
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleGenerateDeductionRegisterExcel}
                  >
                    <PiReceiptFill className="mr-2 h-4 w-4" />
                    Deduction Register
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGeneratePayslipExcel}>
                    <PiFileTextFill className="mr-2 h-4 w-4" />
                    Allotment / Payslip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isDataLoading ? (
            <CardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="bg-blue-800 text-white py-3">
                <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                  <p className="text-xl pt-0">Exchange rate of USD</p>
                  <div className="text-3xl font-bold self-end mt-4 flex justify-between w-full">
                    <p>₱</p>
                    <p>{formatNumber(forexRate) || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800 text-white py-3">
                <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                  <p className="text-xl pt-0">Total Gross Allotment</p>
                  <div className="text-3xl font-bold self-end mt-4 flex justify-between w-full">
                    <p>₱</p>
                    <p>
                      {new Intl.NumberFormat(undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(Number(totalGross))}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800 text-white py-3">
                <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                  <p className="text-xl pt-0">Total Deduction</p>
                  <div className="text-3xl font-bold self-end mt-4 flex justify-between w-full">
                    <p>₱</p>
                    <h3>
                      {new Intl.NumberFormat(undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(Number(totalDeduction))}
                    </h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-800 text-white py-3">
                <CardContent className="pt-0 h-full flex flex-col justify-between gap-y-5">
                  <p className="text-xl pt-0">Total Net Allotment</p>
                  <div className="text-3xl font-bold self-end mt-4 flex justify-between w-full">
                    <p>₱</p>
                    <p>
                      {new Intl.NumberFormat(undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(Number(totalNet))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search Vessel Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-[#EAEBF9]"
            />
          </div>

          <div className="bg-white rounded-md border pb-3">
            {isDataLoading ? (
              <TableSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={filteredAllotment}
                pageSize={7}
              />
            )}

            {selectedVessel && (
              <AlertDialog
                open={showPostDialog}
                onOpenChange={setShowPostDialog}
              >
                <AlertDialogContent className="bg-white p-10">
                  <AlertDialogHeader className="flex flex-col items-center space-y-2">
                    <CircleAlert size={60} strokeWidth={1} color="orange" />
                    <AlertDialogTitle className="text-xl text-center">
                      Post Payroll for {selectedVessel.vesselName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-base text-gray-600">
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex items-center justify-center space-x-4 px-4 mt-1">
                    <AlertDialogCancel className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white hover:text-white">
                      No, Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="w-1/2 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handlePostVesselPayroll(selectedVessel)}
                      disabled={payrollLoading}
                    >
                      {payrollLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Yes, Process Payroll"
                      )}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
