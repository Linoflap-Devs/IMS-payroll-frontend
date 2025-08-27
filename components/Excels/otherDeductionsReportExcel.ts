"use client";
import * as XLSX from "xlsx";
import { capitalizeFirstLetter, getMonthName } from "@/lib/utils";
import { toast } from "../ui/use-toast";
import { otherDeductionsData } from "@/src/services/deduction/crewDeduction.api";

export interface OtherDeductionsResponse {
    success: boolean;
    message: string;
    data: otherDeductionsData;
}

// Extract month & year from message (like "3/2025")
function extractPeriod(message: string): { month: string; year: number } {
  const regex = /(\d+)\/(\d+)/;
  const match = message.match(regex);
  if (match && match.length >= 3) {
    const monthNum = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return {
      month: getMonthName(monthNum),
      year: year,
    };
  }
  return {
    month: "FEBRUARY", // fallback
    year: 2025,
  };
}

export function generateOtherDeductionsReportExcel(
  data: OtherDeductionsResponse,
  dateGenerated: Date,
  mode: "all" | "vessel" = "vessel"
): boolean {
  if (!data.success || !data.data || data.data.Crew.length === 0) {
    toast({
      title: "Error",
      description: "Invalid or empty data for report.",
      variant: "destructive",
    });
    return false;
  }

  try {
    const vesselData = data.data;
    const period = extractPeriod(data.message);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // --- Header block (multi-line) ---
    const headerRows: any[][] = [
      ["IMS PHILIPPINES"],
      ["MARITIME CORP."],
      [`${capitalizeFirstLetter(period.month)} ${period.year}`],
      ["CREW DEDUCTIONS REPORT"],
      [mode === "vessel" ? "VESSEL" : "ALL VESSELS"],
      ["ALL VESSELS EXCHANGE RATE: 1 USD = 55.10 PHP"],
      [dateGenerated.toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" })],
      [], // blank line before table
    ];

    // --- Main Sheet ---
    const rows: any[] = [
      ["Crew Name", "Vessel Name", "Amount", "Deduction", "Remarks"], // Table header
    ];

    vesselData.Crew.forEach((crew) => {
      const crewName = `${crew.LastName}, ${crew.FirstName} ${
        crew.MiddleName ? crew.MiddleName + " " : ""
      }`;

      rows.push([
        crewName,
        crew.VesselName,
        crew.DeductionAmount || 0,
        crew.DeductionName || "",
        crew.DeductionRemarks || "",
      ]);
    });

    // Add total row
    const totalAmount = vesselData.Crew.reduce(
      (sum, c) => sum + (c.DeductionAmount || 0),
      0
    );
    rows.push(["TOTAL", "", totalAmount, "", ""]);

    // Merge header + rows
    const finalRows = [...headerRows, ...rows];

    // replace your getColumnWidths with this
    function getColumnWidths(rows: any[][]): XLSX.ColInfo[] {
    // find how many columns we need
    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);

    const cols: XLSX.ColInfo[] = [];
    for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        const maxLength = rows.reduce((max, row) => {
        const val = row[colIndex] != null ? String(row[colIndex]) : "";
        return Math.max(max, val.length + 2); // padding
        }, 10);
        cols[colIndex] = { wch: maxLength };
    }
    return cols;
    }

    const ws = XLSX.utils.aoa_to_sheet(finalRows);
    ws["!cols"] = getColumnWidths(finalRows);

    // Manually increase VesselName column width (index 1)
    if (ws["!cols"] && ws["!cols"][1]) {
    ws["!cols"][1].wch = 20; // force to 30 characters wide
    }

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      vesselData.VesselName?.substring(0, 31) || "Deductions"
    );

    // --- Save Excel ---
    const fileName =
      mode === "vessel"
        ? `CrewDeductions_${capitalizeFirstLetter(
            vesselData.VesselName?.replace(" ", "-") || ""
          )}_${capitalizeFirstLetter(period.month)}-${period.year}.xlsx`
        : `CrewDeductions_ALL_${capitalizeFirstLetter(
            period.month
          )}-${period.year}.xlsx`;

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating Crew Deductions Excel:", error);
    return false;
  }
}

export default generateOtherDeductionsReportExcel;
