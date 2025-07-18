import { capitalizeFirstLetter, getMonthName } from "@/lib/utils";
import * as XLSX from "xlsx";

export interface Allottee {
  AllotteeName: string;
  AccountNumber: string;
  Bank: string;
  NetAllotment: number;
  Currency: number;
}

export interface AllotmentRegisterCrew {
  CrewID: number;
  CrewName: string;
  Rank: string;
  BasicWage: string;
  FixedOT: string;
  GuarOT: string;
  DollarGross: string;
  PesoGross: number;
  TotalDeduction: number;
  Net: number;
  Allottee: Allottee[];
}

export interface AllotmentRegisterData {
  VesselID: number;
  VesselName: string;
  ExchangeRate: number;
  Crew: AllotmentRegisterCrew[];
}

export function generateAllotmentExcel(
  allotmentData: AllotmentRegisterData[],
  month: string,
  year: number,
  globalExchangeRate: number
): void {
  if (!allotmentData?.length) {
    console.warn("No allotment data available");
    return;
  }

  const wb = XLSX.utils.book_new();

  allotmentData.forEach((vessel, vIndex) => {
    const wsData: any[][] = [];

    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${String(now.getFullYear()).slice(2)} ${now.toLocaleTimeString("en-US", { hour12: false })}`;

    // Headers
    wsData.push(["IMS PHILIPPINES"]);
    wsData.push(["MARITIME CORP."]);
    wsData.push([`${month.toUpperCase()} ${year}`]);
    wsData.push(["ALLOTMENT PAYROLL REGISTER"]);
    wsData.push(["VESSEL"]);
    wsData.push([`${vessel.VesselName} EXCHANGE RATE: USD 1.00 = PHP ${vessel.ExchangeRate}`]);
    wsData.push([formattedDate]);
    wsData.push([]); // Spacer

    // Table Header
    wsData.push([
      "CREW NAME",
      "RANK",
      "BASIC WAGE",
      "FIXED OT",
      "GUAR OT",
      "DOLLAR GROSS",
      "PESO GROSS",
      "TOTAL DED.",
      "NET",
      "ALLOTTEE NAME",
      "ACCOUNT NUMBER",
      "BANK",
      "ALLOTMENT"
    ]);

    vessel.Crew.forEach((crew) => {
      const baseRow = [
        crew.CrewName,
        crew.Rank,
        crew.BasicWage,
        crew.FixedOT,
        crew.GuarOT,
        crew.DollarGross,
        crew.PesoGross,
        crew.TotalDeduction,
        crew.Net
      ];

      if (crew.Allottee?.length) {
        crew.Allottee.forEach((allottee, index) => {
          const netAllotment =
            allottee.Currency === 1
              ? allottee.NetAllotment * (vessel.ExchangeRate || globalExchangeRate)
              : allottee.NetAllotment;

          const row = index === 0
            ? [...baseRow, allottee.AllotteeName, allottee.AccountNumber, allottee.Bank, netAllotment.toFixed(2)]
            : new Array(9).fill("").concat([
                allottee.AllotteeName,
                allottee.AccountNumber,
                allottee.Bank,
                netAllotment.toFixed(2)
              ]);

          wsData.push(row);
        });
      } else {
        wsData.push([...baseRow, "", "", "", ""]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto width calculation
    const colWidths = wsData[0].map((_, colIndex: number) => {
      const maxLength = wsData.reduce((max, row) => {
        const val = row[colIndex] ? row[colIndex].toString() : "";
        return Math.max(max, val.length + 2);
      }, 10);
      return { wch: maxLength };
    });

    // Optionally tweak specific widths
    colWidths[1] = { wch: 20 }; // RANK
    colWidths[2] = { wch: 12 }; // BASIC WAGE
    colWidths[3] = { wch: 12 }; // FIXED OT
    
    colWidths[4] = { wch: 14 }; // GUAR OT
    colWidths[5] = { wch: 14 }; // DOLLAR GROSS
    colWidths[6] = { wch: 14 }; // PESO GROSS
    colWidths[7] = { wch: 14 }; // TOTAL DED.
    colWidths[8] = { wch: 14 }; // NET
    
    colWidths[9] = { wch: 30 }; // ALLOTTEE NAME
    colWidths[10] = { wch: 25 }; // ACCOUNT NUMBER
    colWidths[11] = { wch: 22 }; // BANK
    colWidths[12] = { wch: 20 }; // ALLOTMENT

    ws["!cols"] = colWidths;

    const sheetName = `${vessel.VesselName.slice(0, 25)}-${vIndex + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // const fileName = `allotment-register-${month.toLowerCase()}-${year}.xlsx`;

  const fileName = allotmentData.length > 1
              ? `Allotment_ALL_${capitalizeFirstLetter(month)}-${year}.xlsx`
              : `Allotment_${capitalizeFirstLetter(allotmentData[0].VesselName.replace(' ', '-'))}_${capitalizeFirstLetter(month)}-${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
