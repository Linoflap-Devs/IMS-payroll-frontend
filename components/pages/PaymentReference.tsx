"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Pencil,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  getPaymentReferences,
  PaymentReferenceItem,
} from "@/src/services/payment-reference/payment-reference.api";
import { AddPaymentReference } from "../dialogs/AddPaymentReferenceDialog";

export default function PaymentReference() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deductionTypeFilter, setdeductionTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentReferenceItem[]>([]);
  const [isAddPayment, setAddPayment] = useState(false);
  const [selectedPaymentData, setSelectedPaymentData] =
    useState<PaymentReferenceItem | null>(null);
  const [editselectedPaymentDialogOpen, setEditselectedPaymentDialogOpen] =
    useState(false);

  useEffect(() => {
    setIsLoading(true);

    getPaymentReferences()
      .then((response) => {
        if (response.success) {
          setPaymentData(response.data);
        } else {
          console.error("Failed to fetch payment data:", response.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching payment references:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredDataPayment = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return paymentData.filter((item) => {
      if (!item) return false; // Skip undefined entries

      const matchesSearch =
        item.PaymentReferenceNumber?.toString().includes(term) ||
        item.DeductionType?.toLowerCase().includes(term) ||
        item.Amount?.toString().toLowerCase().includes(term) ||
        item.PayMonth?.toString().includes(term) ||
        item.PayYear?.toString().includes(term);

      const matchesRole =
        deductionTypeFilter === "all" ||
        item.DeductionType === deductionTypeFilter;

      return matchesSearch && matchesRole;
    });
  }, [paymentData, searchTerm, deductionTypeFilter]);

  const uniqueDeductionType = useMemo(() => {
    return [
      ...new Set(
        paymentData
          .filter((item) => item) // remove undefined
          .map((item) => item.DeductionType)
      ),
    ];
  }, [paymentData]);

  const columns: ColumnDef<PaymentReferenceItem>[] = [
    {
      accessorKey: "PaymentReferenceID",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Reference ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("PaymentReferenceID") ?? "").toString().trim()}
        </div>
      ),
    },
    {
      accessorKey: "PayMonth",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pay Month
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("PayMonth") ?? "").toString().trim()}
        </div>
      ),
    },
    {
      accessorKey: "PayYear",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pay Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("PayYear") ?? "").toString().trim()}
        </div>
      ),
    },
    {
      accessorKey: "DeductionType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deduction Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("DeductionType") as string).trim()}
        </div>
      ),
    },
    {
      accessorKey: "Amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("Amount") ?? "").toString().trim()}
        </div>
      ),
    },
    {
      accessorKey: "PaymentReferenceNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Payment Reference Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm text-center">
          {(row.getValue("PaymentReferenceNumber") as string).trim()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const PaymentReferenceID = row.original;

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
                <DropdownMenuItem asChild className="text-xs sm:text-sm">
                  <DropdownMenuItem
                    className="text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedPaymentData(row.original);
                      setEditselectedPaymentDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Edit Payment Reference
                  </DropdownMenuItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold mb-0">Payment Reference</h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-muted-foreground" />
              <Input
                placeholder="Search crew by name, code, or rank..."
                className="bg-[#EAEBF9] pl-8 sm:pl-9 py-4 sm:py-5 text-xs sm:text-sm h-9 sm:h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
              <Select
                value={deductionTypeFilter}
                onValueChange={setdeductionTypeFilter}
              >
                <SelectTrigger className="h-9 sm:h-10 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 min-w-[160px] sm:min-w-[170px] w-full sm:w-auto">
                  <Filter className="h-4 sm:h-4.5 w-4 text-bold text-primary sm:w-4.5" />
                  <SelectValue placeholder="Filter by rank" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Deduction Types</SelectItem>
                  {uniqueDeductionType.map((deduction) => (
                    <SelectItem key={deduction} value={deduction}>
                      {deduction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                <Button
                  className="bg-[#21299D] hover:bg-indigo-700 px-6"
                  onClick={() => setAddPayment(true)}
                >
                  <Plus />
                  Add Payment Reference
                </Button>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">
                Loading payment reference data...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md border pb-3">
              <DataTable columns={columns} data={filteredDataPayment} />
            </div>
          )}
        </div>
      </div>
      <AddPaymentReference
        open={isAddPayment}
        onOpenChange={setAddPayment}
        onSuccess={(newPayment) => {
          if (newPayment) {
            setPaymentData((prev) => [...prev, newPayment]);
          }
        }}
      />
    </div>
  );
}
