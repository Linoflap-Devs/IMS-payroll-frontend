"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  User,
  Phone,
  PhoneCall,
  Mail,
  MoreHorizontal,
  Filter,
  BadgeCheck,
  Ship,
  Calendar,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RiShieldStarLine } from "react-icons/ri";
import { AddRemittanceDialog } from "@/components/dialogs/AddRemittanceDialog";
import { Switch } from "@/components/ui/switch";
import { CheckboxItem } from "@radix-ui/react-dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import Swal from "sweetalert2";
import {
  getCrewRemittanceDetails,
  CrewRemittanceDetailItem,
  CrewRemittanceItem,
  getCrewRemittanceList,
  getAllottees,
  deleteCrewRemittance,
  type AllotteeOption,
} from "@/src/services/remittance/crewRemittance.api";
import { getCrewBasic } from "@/src/services/crew/crew.api";

const REMITTANCE_STATUS_CONFIG = [
  { value: 0, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: 1, label: "Completed", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Declined", color: "bg-red-100 text-red-800" },
  { value: 3, label: "On Hold", color: "bg-gray-100 text-gray-800" },
  { value: 4, label: "Adjusted", color: "bg-blue-100 text-blue-800" },
] as const;

const REMITTANCE_STATUS_LABELS = REMITTANCE_STATUS_CONFIG.map(
  (status) => status.label
);
const REMITTANCE_STATUS_VALUES = REMITTANCE_STATUS_CONFIG.map(
  (status) => status.value
);

type RemittanceStatusLabel = (typeof REMITTANCE_STATUS_LABELS)[number];

type RemittanceEntry = {
  remittanceId: number; // Add this field for delete functionality
  allottee: string;
  amount: number;
  remarks?: string;
  status: RemittanceStatusLabel;
};

// Helper functions for status handling
const getStatusByLabel = (label: string) => {
  return REMITTANCE_STATUS_CONFIG.find(
    (status) => status.label.toLowerCase() === label.toLowerCase()
  );
};

const getStatusByValue = (value: number) => {
  return REMITTANCE_STATUS_CONFIG.find((status) => status.value === value);
};

const getStatusText = (statusInput: string | number): RemittanceStatusLabel => {
  try {
    if (typeof statusInput === "number") {
      const foundStatus = getStatusByValue(statusInput);
      return foundStatus?.label || "Pending";
    } else {
      const normalizedStatus = statusInput?.toString().toLowerCase().trim();
      const foundStatus = REMITTANCE_STATUS_CONFIG.find(
        (status) => status.label.toLowerCase() === normalizedStatus
      );
      return foundStatus?.label || "Pending";
    }
  } catch (error) {
    return "Pending";
  }
};

const getStatusColor = (statusLabel: string) => {
  const foundStatus = getStatusByLabel(statusLabel);
  return foundStatus?.color || "bg-gray-100 text-gray-800";
};

export default function RemittanceDetails() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isAddRemittanceOpen, setIsAddRemittanceOpen] = useState(false);
  const [isDollar, setIsDollar] = useState(false);
  const [remittanceData, setRemittanceData] = useState<RemittanceEntry[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [allottees, setAllottees] = useState<AllotteeOption[]>([]);
  const [crewData, setCrewData] = useState({
    name: "",
    rank: "",
    vessel: "",
    crewCode: "",
    mobileNo: "",
    landlineNo: "",
    emailAddress: "",
    birthday: "",
  });

  // Delete function
  const handleDeleteRemittance = async (remittanceId: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Are you sure you want to delete this remittance? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        const response = await deleteCrewRemittance(
          crewData.crewCode,
          remittanceId
        );

        if (response.success) {
          await Swal.fire({
            title: "Deleted!",
            text: "The remittance has been successfully deleted.",
            icon: "success",
            confirmButtonColor: "#22c55e",
          });

          // Refresh the data
          fetchRemittanceData(crewData.crewCode);
        } else {
          await Swal.fire({
            title: "Error!",
            text: response.message || "Failed to delete remittance.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    } catch (error: any) {
      console.error("Delete error:", error);

      let errorMsg = "An error occurred while deleting the remittance";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      await Swal.fire({
        title: "Error!",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Updated columns definition with delete functionality
  const remittanceColumns: ColumnDef<RemittanceEntry>[] = [
    {
      accessorKey: "allottee",
      header: "Allottee",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className="text-center">
            ₱
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusText =
          typeof status === "string" ? status : String(status || "Pending");

        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium min-w-[80px] text-center ${getStatusColor(
                statusText
              )}`}
            >
              {statusText}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const remittanceId = row.original.remittanceId;

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
                <DropdownMenuItem
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteRemittance(remittanceId)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const fetchRemittanceData = async (crewCode: string) => {
    if (crewCode) {
      try {
        const response = await getCrewRemittanceDetails(crewCode);

        if (response.success && response.data.length > 0) {
          const years = [...new Set(response.data.map((item) => item.Year))];
          setAvailableYears(years.sort((a, b) => b - a));

          const sortedData = [...response.data].sort((a, b) => {
            const dateA = new Date(a.Year, getMonthNumber(a.Month));
            const dateB = new Date(b.Year, getMonthNumber(b.Month));
            return dateB.getTime() - dateA.getTime();
          });

          const latestRemittance = sortedData[0];

          setSelectedMonth(latestRemittance.Month);
          setSelectedYear(latestRemittance.Year.toString());

          const filteredData = sortedData
            .filter(
              (item) =>
                item.Month === latestRemittance.Month &&
                item.Year === latestRemittance.Year
            )
            .map((item) => {
              const mappedItem: RemittanceEntry = {
                remittanceId: item.RemittanceHeaderID, // Include remittance ID for delete
                allottee: String(item.AllotteeName || ""),
                amount: Number(item.Amount) || 0,
                remarks: String(item.Remarks || ""),
                status: getStatusText(item.Status),
              };
              return mappedItem;
            });

          const validatedData = filteredData.filter((item) => {
            const isValid =
              typeof item.allottee === "string" &&
              typeof item.amount === "number" &&
              typeof item.status === "string" &&
              typeof item.remittanceId === "number";
            return isValid;
          });

          setRemittanceData(validatedData);
        } else {
          setRemittanceData([]);
        }
      } catch (error) {
        console.error("Error fetching remittance details:", error);
        setRemittanceData([]);
      }
    }
  };

  const fetchAllottees = async (crewCode: string) => {
    if (crewCode) {
      try {
        const response = await getAllottees(crewCode);
        if (response.success) {
          setAllottees(response.data);
        } else {
          setAllottees([]);
        }
      } catch (error) {
        console.error("Error fetching allottees:", error);
        setAllottees([]);
      }
    }
  };

  const getMonthNumber = (month: string): number => {
    const months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };
    return months[month as keyof typeof months] || 0;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crewCodeParam = params.get("crewCode");

    if (crewCodeParam) {
      const decodedCrewCode = decodeURIComponent(crewCodeParam);

      Promise.all([getCrewBasic(decodedCrewCode), getCrewRemittanceList()])
        .then(([basicResponse, remittanceResponse]) => {
          if (basicResponse.success) {
            const { data } = basicResponse;

            const crewVessel = remittanceResponse.success
              ? remittanceResponse.data.find(
                  (item: CrewRemittanceItem) =>
                    item.CrewCode === decodedCrewCode
                )?.Vessel
              : "";

            setCrewData({
              name: `${data.FirstName} ${
                data.MiddleName ? data.MiddleName.charAt(0) + ". " : ""
              }${data.LastName}`,
              rank: data.Rank,
              vessel: crewVessel || "",
              crewCode: decodedCrewCode,
              mobileNo: data.MobileNo,
              landlineNo: data.LandLineNo,
              emailAddress: data.EmailAddress,
              birthday: data.Birthday,
            });

            fetchRemittanceData(decodedCrewCode);
            fetchAllottees(decodedCrewCode);
          }
        })
        .catch((error) => {
          console.error("Error fetching crew details:", error);
        });
    }
  }, []);

  useEffect(() => {
    const updateRemittanceData = async () => {
      if (crewData.crewCode && selectedMonth && selectedYear) {
        try {
          const response = await getCrewRemittanceDetails(crewData.crewCode);
          if (response.success) {
            const filteredData = response.data
              .filter(
                (item) =>
                  item.Month === selectedMonth &&
                  item.Year.toString() === selectedYear
              )
              .map((item) => {
                const mappedItem: RemittanceEntry = {
                  remittanceId: item.RemittanceHeaderID, // Include remittance ID
                  allottee: String(item.AllotteeName || ""),
                  amount: Number(item.Amount) || 0,
                  remarks: String(item.Remarks || ""),
                  status: getStatusText(item.Status),
                };
                return mappedItem;
              });

            const validatedData = filteredData.filter((item) => {
              const isValid =
                typeof item.allottee === "string" &&
                typeof item.amount === "number" &&
                typeof item.status === "string" &&
                typeof item.remittanceId === "number";
              return isValid;
            });

            setRemittanceData(validatedData);
          } else {
            setRemittanceData([]);
          }
        } catch (error) {
          console.error("Error updating remittance details:", error);
          setRemittanceData([]);
        }
      }
    };

    updateRemittanceData();
  }, [crewData.crewCode, selectedMonth, selectedYear]);

  const handleOpenDialog = () => {
    setIsAddRemittanceOpen(true);
  };

  const handleRemittanceSuccess = () => {
    if (crewData.crewCode) {
      setTimeout(() => {
        fetchRemittanceData(crewData.crewCode);
      }, 500);
    }
  };

  return (
    <div className="h-full w-full p-4 pt-3">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Link href="/home/remittance">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold">Crew Remittance Details</h1>
          </div>

          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleOpenDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Remittance
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
                <style jsx global>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                <div className="w-60 h-60 min-w-[160px] bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src="/image.png"
                    alt="Profile Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                <h2 className="text-lg font-bold mb-1 w-full">
                  {crewData.name}
                </h2>
                <div className="flex items-center gap-3 mb-3 flex-wrap justify-center">
                  <div className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded-full border-green-300 flex items-center gap-1 flex-shrink-0">
                    Active
                  </div>
                </div>

                <div className="w-full space-y-3 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Crew Code</div>
                      <div className="text-sm font-medium truncate">
                        {crewData.crewCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiShieldStarLine className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Rank</div>
                      <div className="text-sm font-medium truncate">
                        {crewData.rank}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">
                        Current Vessel
                      </div>
                      <div className="text-sm font-medium truncate">
                        {crewData.vessel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">Age</div>
                      <div className="text-sm font-medium truncate">18</div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-4 pt-4 border-t min-w-0">
                  <h3 className="text-md font-semibold mb-3 text-left">
                    Contact Information
                  </h3>

                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Mobile Number
                        </div>
                        <div className="text-sm font-medium truncate">
                          {crewData.mobileNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Landline Number
                        </div>
                        <div className="text-sm font-medium truncate">
                          {crewData.landlineNo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500">
                          Email Address
                        </div>
                        <div className="text-sm font-medium truncate">
                          {crewData.emailAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-6 w-full">
                    <div className="w-1/2">
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                          <div className="flex items-center w-full">
                            <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                              Select Month
                            </span>
                            <SelectValue
                              placeholder="Select month"
                              className="text-black text-base pl-3"
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {[
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
                          ].map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2">
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                          <div className="flex items-center w-full">
                            <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                              Select Year
                            </span>
                            <SelectValue
                              placeholder="Select year"
                              className="text-black text-base pl-3"
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="flex items-center">
                      <Checkbox />
                      <span className="ml-2">Remit with payroll</span>
                    </div>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-xl border border-gray-200 overflow-hidden">
                    {remittanceData &&
                    Array.isArray(remittanceData) &&
                    remittanceData.length > 0 ? (
                      <DataTable
                        columns={remittanceColumns}
                        data={remittanceData}
                        pageSize={7}
                      />
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddRemittanceDialog
        open={isAddRemittanceOpen}
        onOpenChange={setIsAddRemittanceOpen}
        crewCode={crewData.crewCode}
        allottees={allottees}
        onSuccess={handleRemittanceSuccess}
      />
    </div>
  );
}
