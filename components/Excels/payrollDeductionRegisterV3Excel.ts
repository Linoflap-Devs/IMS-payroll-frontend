"use client";
import * as XLSX from "xlsx";
import { capitalizeFirstLetter, getMonthName } from "@/lib/utils";
import { Deductions } from "@/src/services/payroll/payroll.api";

// Define interfaces based on your updated data structure
export interface Allottee {
    AllotteeName: string;
    AccountNumber: string;
    Bank: string;
    NetAllotment: number;
    Currency: number;
}

export interface DeductionRegisterCrew {
    CrewID: number;
    CrewName: string;
    Rank: string;
    Salary: number;
    Allotment: number;
    Gross: number;
    Deduction: number;
    Deductions: Deductions[];
}
export interface DeductionRegisterData {
    VesselID: number;
    VesselName: string;
    VesselCode: string;
    VesselType: string;
    Principal: string;
    IsActive: number;
    Crew: DeductionRegisterCrew[];
}

export interface AllotmentRegisterResponse {
    success: boolean;
    message: string;
    data: DeductionRegisterData[];
}

// Extract period info (same as your PDF version)
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

export function generateDeductionRegisterV3Excel(
  data: AllotmentRegisterResponse,
  dateGenerated: Date,
  mode: "all" | "vessel" = "vessel"
): boolean {
  if (!data.success || !data.data || data.data.length === 0) {
    console.error("Invalid or empty data for deduction register");
    return false;
  }

  try {
    const vesselData = data.data;
    const period = extractPeriod(data.message);

    // Prepare workbook
    const wb = XLSX.utils.book_new();

    // --- HEADER block ---
    const headerRows: any[][] = [
      ["IMS PHILIPPINES"],
      ["MARITIME CORP."],
      [`${capitalizeFirstLetter(period.month)} ${period.year}`],
      ["GOVERNMENT DEDUCTION REGISTER"],
      [mode === "vessel" ? "VESSEL" : "ALL VESSELS"],
      ["ALL VESSELS EXCHANGE RATE: 1 USD = 55.1 PHP"],
      [dateGenerated.toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" })],
      [], // blank line before table
    ];

    function getColumnWidths(rows: any[][]) {
      return rows[0].map((_: any, colIndex: number) => {
        const maxLength = rows.reduce((max, row) => {
          const val = row[colIndex] ? row[colIndex].toString() : "";
          return Math.max(max, val.length + 2);
        }, 10);
        return { wch: maxLength };
      });
    }

    if (mode === "all") {
      // --- SUMMARY SHEET ---
      const summaryRows: any[] = [
        ["VESSEL NAME", "SSS", "HDMF", "PHILHEALTH", "PROVIDENT"],
      ];

      let grandTotalSSS = 0;
      let grandTotalHDMF = 0;
      let grandTotalPhilhealth = 0;
      let grandTotalProvident = 0;

      vesselData.forEach((vessel) => {
        let totalSSS = 0;
        let totalHDMF = 0;
        let totalPhilhealth = 0;
        let totalProvident = 0;

        vessel.Crew.forEach((crew) => {
          const sss = crew.Deductions.find((d) => d.Name.toLowerCase() === "sss premium")?.Amount;
          const hdmf = crew.Deductions.find((d) => d.Name.toLowerCase().includes("pag-ibig"))?.Amount;
          const philhealth = crew.Deductions.find((d) => d.Name.toLowerCase().includes("philhealth"))?.Amount;
          const provident = crew.Deductions.find((d) => d.Name.toLowerCase().includes("provident"))?.Amount;

          totalSSS += sss || 0;
          totalHDMF += hdmf || 0;
          totalPhilhealth += philhealth || 0;
          totalProvident += provident || 0;
        });

        grandTotalSSS += totalSSS;
        grandTotalHDMF += totalHDMF;
        grandTotalPhilhealth += totalPhilhealth;
        grandTotalProvident += totalProvident;

        summaryRows.push([vessel.VesselName, totalSSS, totalHDMF, totalPhilhealth, totalProvident]);
      });

      summaryRows.push([
        "GRAND TOTAL",
        grandTotalSSS,
        grandTotalHDMF,
        grandTotalPhilhealth,
        grandTotalProvident,
      ]);

      // Prepend header
      const wsSummary = XLSX.utils.aoa_to_sheet([...headerRows, ...summaryRows]);
      wsSummary["!cols"] = getColumnWidths([...headerRows, ...summaryRows]);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    // --- DETAIL SHEETS (per vessel) ---
    vesselData.forEach((vessel) => {
      const rows: any[] = [
        ["CREW NAME", "SSS", "HDMF", "PHILHEALTH", "PROVIDENT"],
      ];

      let totalSSS = 0;
      let totalHDMF = 0;
      let totalPhilhealth = 0;
      let totalProvident = 0;

      vessel.Crew.forEach((crew) => {
        const sss = crew.Deductions.find((d) => d.Name.toLowerCase() === "sss premium")?.Amount;
        const hdmf = crew.Deductions.find((d) => d.Name.toLowerCase().includes("pag-ibig"))?.Amount;
        const philhealth = crew.Deductions.find((d) => d.Name.toLowerCase().includes("philhealth"))?.Amount;
        const provident = crew.Deductions.find((d) => d.Name.toLowerCase().includes("provident"))?.Amount;

        totalSSS += sss || 0;
        totalHDMF += hdmf || 0;
        totalPhilhealth += philhealth || 0;
        totalProvident += provident || 0;

        rows.push([crew.CrewName, sss || 0, hdmf || 0, philhealth || 0, provident || 0]);
      });

      rows.push(["TOTAL", totalSSS, totalHDMF, totalPhilhealth, totalProvident]);

      // Prepend header
      const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...rows]);
      ws["!cols"] = getColumnWidths([...headerRows, ...rows]);

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        vessel.VesselName.substring(0, 31) // Excel sheet name limit
      );
    });

    // --- SAVE FILE ---
    const fileName =
      mode === "vessel"
        ? `GovDeductionRegister_${capitalizeFirstLetter(
            vesselData[0].VesselName.replace(" ", "-")
          )}_${capitalizeFirstLetter(period.month)}-${period.year}.xlsx`
        : `GovDeductionRegister_ALL_${capitalizeFirstLetter(
            period.month
          )}-${period.year}.xlsx`;

    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error("Error generating Gov Deduction Register Excel:", error);
    return false;
  }
}

export default generateDeductionRegisterV3Excel;
