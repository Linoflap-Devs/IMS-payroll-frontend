"use client";
import * as XLSX from "xlsx";
import { capitalizeFirstLetter, formatCurrency, getMonthName } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";
import { otherDeductionsCrew, otherDeductionsData } from "@/src/services/deduction/crewDeduction.api";

export interface OtherDeductionsResponse {
  success: boolean;
  message: string;
  data: otherDeductionsData;
}

function extractPeriod(message: string): { month: string; year: number } {
  const regex = /(\d+)\/(\d+)/;
  const match = message.match(regex);
  if (match && match.length >= 3) {
    const monthNum = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return { month: getMonthName(monthNum), year };
  }
  return { month: "FEBRUARY", year: 2025 };
}

function calculateTotals(crew: otherDeductionsCrew[]) {
  let cashAdvTotal = 0;
  let deductionTotal = 0;

  crew.forEach((c) => {
    const amount = c.Currency === 2 ? c.OriginalAmount : c.DeductionAmount;
    if (c.DeductionName.toLowerCase().includes("cash advance")) cashAdvTotal += amount;
    else deductionTotal += amount;
  });

  return { cashAdvTotal, deductionTotal };
}

export function generateOtherDeductionsExcel(
  data: OtherDeductionsResponse,
  dateGenerated: Date,
  mode: "all" | "vessel" = "vessel"
) {
  if (!data.success || !data.data || !data.data.Crew || data.data.Crew.length === 0) {
    toast({
      title: "Error",
      description: "Invalid or empty data for date.",
      variant: "destructive",
    });
    return false;
  }

  try {
    const period = extractPeriod(data.message);
    const totals = calculateTotals(data.data.Crew);

    // Prepare worksheet rows
    const wsData: (string | number)[][] = [];

    // Header info
    wsData.push([`CREW DEDUCTIONS REPORT - ${period.month} ${period.year}`]);
    wsData.push([`Vessel: ${data.data.VesselName || "ALL VESSELS"}`]);
    wsData.push([`Exchange Rate: 1 USD = ${formatCurrency(data.data.ExchangeRate)} PHP`]);
    wsData.push([`Date Generated: ${format(dateGenerated, "yyyy-MM-dd HH:mm aa")}`]);
    wsData.push([]); // empty row

    // Column headers
    const headers = [
      "Crew Name",
      "Vessel Name",
      "Cash Adv. Amount",
      "Cash Adv. Remarks",
      "Deduction Name",
      "Deduction Amount",
      "Deduction Remarks",
    ];
    wsData.push(headers);

    // Crew rows
    data.data.Crew.forEach((crew) => {
      const crewName = `${crew.LastName}, ${crew.FirstName} ${crew.MiddleName ? crew.MiddleName[0] + "." : ""}`;

      // Cash Advance Amount: keep as number
      const cashAdvanceAmount: number | "" =
        crew.DeductionName.toLowerCase().includes("cash advance")
          ? crew.Currency === 2
            ? crew.OriginalAmount // USD
            : crew.DeductionAmount // PHP
          : "";

      // Deduction Amount: keep as number (always PHP)
      const deductionAmount: number | "" =
        !crew.DeductionName.toLowerCase().includes("cash advance")
          ? crew.DeductionAmount
          : "";

      const cashAdvRemark = crew.DeductionName.toLowerCase().includes("cash advance") ? crew.DeductionRemarks : "";
      const deductionRemark = !crew.DeductionName.toLowerCase().includes("cash advance") ? crew.DeductionRemarks : "";

      wsData.push([
        crewName,
        crew.VesselName,
        cashAdvanceAmount,
        cashAdvRemark,
        !crew.DeductionName.toLowerCase().includes("cash advance") ? crew.DeductionName : "", // hide "Cash Advance"
        deductionAmount,
        deductionRemark
      ]);
    });

    // Totals row (always in peso)
    wsData.push([]);
    wsData.push(["TOTALS", "", `₱${formatCurrency(totals.cashAdvTotal)}`, "", "", `₱${formatCurrency(totals.deductionTotal)}`, ""]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Bold headers (row 6 = header)
    for (let c = 0; c < headers.length; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 5, c })];
      if (cell && typeof cell.v === "string") cell.s = { font: { bold: true } };
    }

    // Right-align numeric columns (Cash Adv Amount = C = 2, Deduction Amount = F = 5)
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let R = 6; R <= range.e.r; R++) {
      // Cash Adv Amount (C = 2)
      const cashCell = ws[XLSX.utils.encode_cell({ r: R, c: 2 })];
      if (cashCell && typeof cashCell.v === "number") {
        cashCell.z = '$#,##0.00'; // USD
        cashCell.s = { ...cashCell.s, alignment: { horizontal: "right" } };
      }

      // Deduction Amount (F = 5)
      const dedCell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
      if (dedCell && typeof dedCell.v === "number") {
        dedCell.z = '₱#,##0.00'; // PHP
        dedCell.s = { ...dedCell.s, alignment: { horizontal: "right" } };
      }
    }

    // Totals row
    const totalsRow = range.e.r; // last row
    const totalCashCell = ws[XLSX.utils.encode_cell({ r: totalsRow, c: 2 })];
    if (totalCashCell) {
      totalCashCell.z = '₱#,##0.00'; // totals always PHP
      totalCashCell.s = { ...totalCashCell.s, alignment: { horizontal: "right", font: { bold: true } } };
    }

    const totalDedCell = ws[XLSX.utils.encode_cell({ r: totalsRow, c: 5 })];
    if (totalDedCell) {
      totalDedCell.z = '₱#,##0.00';
      totalDedCell.s = { ...totalDedCell.s, alignment: { horizontal: "right", font: { bold: true } } };
    }

    // Set dynamic column widths
    const colWidths = wsData[5].map((_, colIndex) => {
      const maxLength = wsData.reduce((max, row) => {
        const val = row[colIndex] !== undefined && row[colIndex] !== null ? row[colIndex].toString() : "";
        return Math.max(max, val.length);
      }, 10);
      return { wch: maxLength + 5 };
    });

    // Force wider Vessel Name
    if (colWidths[1]) colWidths[1].wch = Math.max(colWidths[1].wch, 30);
    ws["!cols"] = colWidths;

    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Crew Deductions");

    const fileName =
      mode === "vessel"
        ? `CrewDeductions_${capitalizeFirstLetter(data.data.VesselName?.replace(" ", "-") || "")}_${capitalizeFirstLetter(period.month)}-${period.year}.xlsx`
        : `CrewDeductions_ALL_${capitalizeFirstLetter(period.month)}-${period.year}.xlsx`;

    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error("Error generating Crew Deductions Excel:", error);
    return false;
  }
}

export default generateOtherDeductionsExcel;
