"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: boolean;
  pageSize?: number;
  hideHeader?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  selectedRowIds?: Record<string, boolean>;  // new prop
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = true,
  pageSize = 10,
  hideHeader = false,
  onRowSelectionChange,
  selectedRowIds = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const handleRowSelectionChange = (updater: any) => {
    const newSelection =
      typeof updater === "function" ? updater(rowSelection) : updater;

    setRowSelection(newSelection);
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    }
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: (row: any) => row.crewCode,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="bg-[#F9F9F9]">
      <div className="scrollbar-hide bg-[#F9F9F9]">
        <Table>
          {!hideHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-xs sm:text-sm py-3 sm:py-4 text-center whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`h-12 sm:h-14 hover:bg-muted/20 ${
                    selectedRowIds[row.original.CrewCode ?? row.original.crewCode] ? "bg-[#eef1f6]" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2 sm:py-3 text-center"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 sm:h-24 text-center text-xs sm:text-sm">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && data.length > 0 && <DataTablePagination table={table} />}
    </div>
  );
}
