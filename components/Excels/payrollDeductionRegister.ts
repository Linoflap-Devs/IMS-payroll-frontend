import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { Deductions } from "../PDFs/allotmentDeductionRegister";
import { capitalizeFirstLetter } from "@/lib/utils";

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

function getMonthName(monthNum: number): string {
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  return months[monthNum - 1];
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(amount: number | string): string {
  const num = Number(amount);
  return !isNaN(num)
    ? num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";
}

export function generateDeductionAllotmentExcel(
  vesselData: DeductionRegisterData[],
  month: number,
  year: number,
  exchangeRate: number = 56.1
): void {
  const workbook = XLSX.utils.book_new();
  const monthName = getMonthName(month);

  vesselData.forEach((vessel, vesselIndex) => {
    const wsData: (string | number)[][] = [];

    // Header
    wsData.push(["IMS PHILIPPINES"]);
    wsData.push(["MARITIME CORP."]);
    wsData.push([`${monthName} ${year}`]);
    wsData.push(["ALLOTMENT DEDUCTION REGISTER"]);
    wsData.push(["VESSEL"]);
    wsData.push([`${vessel.VesselName} EXCHANGE RATE: USD 1.00 = PHP ${formatNumber(exchangeRate)}`]);
    wsData.push([dayjs().format("MM/DD/YY HH:mm")]);
    wsData.push([]);

    // Table headers
    wsData.push([
      "CREW NAME",
      "RANK",
      "SALARY",
      "GROSS",
      "DEDUCTION NAME",
      "CURRENCY",
      "AMOUNT",
      "PHP EQUIVALENT",
    ]);

    // Content
    vessel.Crew.forEach((crew) => {
      const hasDeductions = crew.Deductions?.length > 0;

      if (hasDeductions) {
        crew.Deductions.forEach((deduction, idx) => {
          const isUSD = deduction.Currency === 1;
          const amount = Number(deduction.Amount) || 0;
          const forexRate = deduction.ExchangeRate ?? exchangeRate;
          const phpEquivalent = isUSD ? amount * forexRate : amount;

          wsData.push([
            idx === 0 ? crew.CrewName : "",
            idx === 0 ? crew.Rank : "",
            idx === 0 ? formatNumber(crew.Salary) : "",
            idx === 0 ? formatNumber(crew.Gross) : "",
            deduction.Name,
            isUSD ? "USD" : "PHP",
            formatNumber(amount),
            formatNumber(phpEquivalent),
          ]);
        });
      } else {
        wsData.push([
          crew.CrewName,
          crew.Rank,
          formatNumber(crew.Salary),
          formatNumber(crew.Gross),
          "No Deduction",
          "-",
          "-",
          "-",
        ]);
      }
    });

    wsData.push([]);
    wsData.push([`Page ${vesselIndex + 1} out of ${vesselData.length}`]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-width
    const colWidths = wsData[0].map((_, colIndex: number) => {
      const maxLength = wsData.reduce((max, row) => {
        const val = row[colIndex] ? row[colIndex].toString() : "";
        return Math.max(max, val.length + 2);
      }, 10);
      return { wch: maxLength };
    });

    colWidths[0] = { wch: 30 }; // Crew Name
    colWidths[4] = { wch: 28 }; // Deduction Name
    colWidths[6] = { wch: 15 }; // Amount
    colWidths[7] = { wch: 18 }; // PHP Equivalent

    ws["!cols"] = colWidths;

    const sheetName = vessel.VesselName.length > 31
      ? vessel.VesselName.slice(0, 28) + "..."
      : vessel.VesselName;

    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  });

  const fileName = vesselData.length > 1
    ? `Deduction_ALL_${capitalizeFirstLetter(monthName)}-${year}.xlsx`
    : `Deduction_${capitalizeFirstLetter(vesselData[0].VesselName.replace(' ', '-'))}_${capitalizeFirstLetter(monthName)}-${year}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
