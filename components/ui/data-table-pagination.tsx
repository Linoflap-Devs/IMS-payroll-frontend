"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const pageNumbers = [];

    // Always show first page
    if (currentPage > 2) {
      pageNumbers.push(1);
    }

    // Show ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push("ellipsis");
    }

    // Show current page and adjacent pages
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pageNumbers.push(i);
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push("ellipsis");
    }

    // Always show last page
    if (currentPage < totalPages - 1 && totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mt-3 sm:mt-4 pb-2 bg-[#F9F9F9]">
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === "ellipsis") {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8"
            >
              <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          );
        }

        const pageNumber = Number(page);
        const isCurrentPage =
          table.getState().pagination.pageIndex + 1 === pageNumber;

        return (
          <Button
            key={page}
            variant={isCurrentPage ? "default" : "outline"}
            size="icon"
            onClick={() => table.setPageIndex(pageNumber - 1)}
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm",
              isCurrentPage && "bg-primary hover:bg-primary/90"
            )}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
