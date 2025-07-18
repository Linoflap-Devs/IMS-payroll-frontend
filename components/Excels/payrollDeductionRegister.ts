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

    // Header section (Company & Title)
    wsData.push(["IMS PHILIPPINES"]);
    wsData.push(["MARITIME CORP."]);
    wsData.push([`${monthName} ${year}`]);
    wsData.push(["ALLOTMENT DEDUCTION REGISTER"]);
    wsData.push(["VESSEL"]);
    wsData.push([`${vessel.VesselName} EXCHANGE RATE: USD 1.00 = PHP ${exchangeRate.toFixed(2)}`]);
    wsData.push([dayjs().format("MM/DD/YY hh:mm A")]);
    wsData.push([]); // spacer

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

    // Content section
    vessel.Crew.forEach((crew) => {
      const hasDeductions = crew.Deductions && crew.Deductions.length > 0;

      if (hasDeductions) {
        crew.Deductions.forEach((deduction, idx) => {
          const isUSD = deduction.Currency === 1;
          const amount = deduction.Amount;
          const forexRate = deduction.ExchangeRate ?? exchangeRate;
          const phpEquivalent = isUSD ? amount * forexRate : amount;

          wsData.push([
            idx === 0 ? crew.CrewName : "",
            idx === 0 ? crew.Rank : "",
            idx === 0 ? formatCurrency(crew.Salary) : "",
            idx === 0 ? formatCurrency(crew.Gross) : "",
            deduction.Name,
            isUSD ? "USD" : "PHP",
            formatCurrency(amount),
            formatCurrency(phpEquivalent),
          ]);
        });
      } else {
        // Still include if no deductions
        wsData.push([
          crew.CrewName,
          crew.Rank,
          formatCurrency(crew.Salary),
          formatCurrency(crew.Gross),
          "No Deduction",
          "-",
          "-",
          "-",
        ]);
      }
    });

    // Optional: footer
    wsData.push([]);
    wsData.push([`Page ${vesselIndex + 1} out of ${vesselData.length}`]);

    // Generate worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-width
    const colWidths = wsData[0].map((_, colIndex: number) => {
      const maxLength = wsData.reduce((max, row) => {
        const val = row[colIndex];
        return Math.max(max, val ? val.toString().length + 2 : 10);
      }, 10);
      return { wch: maxLength };
    });

    // Optional manual tweaks
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

  //const fileName = `deduction_allotment_register_${monthName.toLowerCase()}_${year}.xlsx`;

  const fileName = vesselData.length > 1
              ? `Deduction_ALL_${capitalizeFirstLetter(getMonthName(month))}-${year}.xlsx`
              : `Deduction_${capitalizeFirstLetter(vesselData[0].VesselName.replace(' ', '-'))}_${capitalizeFirstLetter(getMonthName(month))}-${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
