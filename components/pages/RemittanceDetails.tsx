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

type RemittanceEntry = {
  allottee: string;
  amount: number;
  remarks?: string;
  status: "Completed" | "Pending" | "Adjusted" | "Failed" | "On Hold";
};

const sampleRemittance: RemittanceEntry[] = [
  {
    allottee: "Thomas Shelby",
    amount: 200.0,
    remarks: "Remarks",
    status: "Completed",
  },
  {
    allottee: "Arthur Shelby",
    amount: 200.0,
    remarks: "Remarks",
    status: "Pending",
  },
  {
    allottee: "Ada Thorne",
    amount: 200.0,
    remarks: "Remarks",
    status: "Adjusted",
  },
  {
    allottee: "Polly Shelby",
    amount: 200.0,
    remarks: "Remarks",
    status: "Failed",
  },
  {
    allottee: "Grace Burgess",
    amount: 200.0,
    remarks: "Remarks",
    status: "On Hold",
  },
];

const remittanceColumns: ColumnDef<RemittanceEntry>[] = [
  {
    accessorKey: "allottee",
    header: "Allottee",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div className="text-right">{row.original.amount.toFixed(2)}</div>;
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
      const getStatusColor = (status: string) => {
        switch (status) {
          case "Completed":
            return "bg-green-100 text-green-800";
          case "Pending":
            return "bg-yellow-100 text-yellow-800";
          case "Adjusted":
            return "bg-blue-100 text-blue-800";
          case "Failed":
            return "bg-red-100 text-red-800";
          case "On Hold":
            return "bg-gray-100 text-gray-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      return (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const handleDelete = () => {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton:
              "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-2 rounded",
            cancelButton:
              "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mx-2 rounded",
          },
          buttonsStyling: false,
        });

        swalWithBootstrapButtons
          .fire({
            title: "Are you sure?",
            text: "Are you sure you want to delete this remittance? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
          })
          .then((result) => {
            if (result.isConfirmed) {
              // Place your delete logic here, for example, API call or state update
              swalWithBootstrapButtons.fire({
                title: "Deleted!",
                text: "The remittance has been successfully deleted.",
                icon: "success",
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              swalWithBootstrapButtons.fire({
                title: "Cancelled",
                text: "Your remittance is safe :)",
                icon: "error",
              });
            }
          });
      };
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
                className="text-red-600"
                onClick={() => handleDelete()}
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

export default function DeductionEntries() {
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedAllottee, setSelectedAllottee] = useState("1");
  const [isAddRemittanceOpen, setIsAddRemittanceOpen] = useState(false);
  const [isDollar, setIsDollar] = useState(false);
  const [crewData, setCrewData] = useState({
    name: "",
    rank: "",
    vessel: "",
    crewCode: "",
  });

  // Read the parameters from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    const rankParam = params.get("rank");
    const vesselParam = params.get("vessel");
    const crewCodeParam = params.get("crewCode");

    if (nameParam && rankParam && vesselParam && crewCodeParam) {
      setCrewData({
        name: decodeURIComponent(nameParam),
        rank: decodeURIComponent(rankParam),
        vessel: decodeURIComponent(vesselParam),
        crewCode: decodeURIComponent(crewCodeParam),
      });
    }
  }, []);

  // Handle tab change

  return (
    <div className="h-full w-full p-4 pt-3">
      <div className="flex flex-col space-y-6">
        {/* Header with back button and title */}
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
            onClick={() => setIsAddRemittanceOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Remittance
          </Button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with crew info */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center text-center overflow-y-auto scrollbar-hide flex-1">
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
                          099989898889
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
                          4327966
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
                          sample@gmail.com
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right content area with tabs */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <div className="w-full flex flex-col h-full">
                <div className="p-6 mt-0 overflow-y-auto flex-1">
                  <div className="space-y-6">
                    {/* New select on top */}
                    <div className="flex justify-center">
                      <Select
                        value={selectedAllottee}
                        onValueChange={setSelectedAllottee}
                      >
                        <SelectTrigger className="bg-white border border-gray-200 rounded-xs h-12 w-full pl-0">
                          <div className="flex items-center w-full">
                            <span className="text-gray-500 text-base bg-[#F6F6F6] rounded-l-xs px-3 py-1.5 mr-5">
                              Select Allottee
                            </span>
                            <SelectValue className="text-black text-base pl-3" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Juan De La Cruz</SelectItem>
                          <SelectItem value="2">Asta Calleja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="January">January</SelectItem>
                            <SelectItem value="February">February</SelectItem>
                            <SelectItem value="March">March</SelectItem>
                            <SelectItem value="April">April</SelectItem>
                            <SelectItem value="May">May</SelectItem>
                            <SelectItem value="June">June</SelectItem>
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="August">August</SelectItem>
                            <SelectItem value="September">September</SelectItem>
                            <SelectItem value="October">October</SelectItem>
                            <SelectItem value="November">November</SelectItem>
                            <SelectItem value="December">December</SelectItem>
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
                              <SelectValue className="text-black text-base pl-3" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div>
                        <Checkbox />
                        <span className="ml-2">Remit with payroll</span>
                      </div>
                    </div>

                    <div className="bg-[#F9F9F9] rounded-xl border border-gray-200 overflow-hidden pb-3">
                      <DataTable
                        columns={remittanceColumns}
                        data={sampleRemittance}
                        pageSize={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <AddRemittanceDialog
        open={isAddRemittanceOpen}
        onOpenChange={setIsAddRemittanceOpen}
      />
    </div>
  );
}
