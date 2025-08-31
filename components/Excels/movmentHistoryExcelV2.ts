import * as XLSX from "xlsx";
import { format } from "date-fns";

// Define interfaces based on your updated data structure
export interface Movement {
    VesselName: string;
    Rank: string;
    OnboardDate: Date | null;
    OffboardDate: Date | null;
    Promotion: number;
    Remarks: string | null;
}

export interface CrewMovementHistory {
    CrewID: number;
    CrewCode: string;
    FirstName: string;
    MiddleName: string | null;
    LastName: string;
    Rank: string;
    Movements: Movement[];
}

export interface MovementHistoryPDFResponse {
    success: boolean;
    message: string;
    data: CrewMovementHistory[];
}

export function generateMovementHistoryExcelV2(
  crewData: CrewMovementHistory[],
  month: number,
  year: number,
  dateGenerated: Date,
  mode: "vessel" | "all" = "vessel"
): void {
  if (!crewData || crewData.length === 0) {
    console.error("Invalid or empty data for Excel export");
    return;
  }

  try {
    // --- Header block ---
    const headerRows: any[][] = [
      ["IMS PHILIPPINES"],
      ["MARITIME CORP."],
      [`${new Date(year, month - 1).toLocaleString("en-PH", { month: "long", year: "numeric" })}`],
      ["CREW DEDUCTIONS REPORT"],
      //[mode === "vessel" ? "VESSEL" : "ALL VESSELS"],
      [dateGenerated.toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" })],
      [], // blank line before table
    ];

    // --- Table header ---
    const tableHeader: any[][] = [
      ["CREW NAME", "VESSEL", "SIGN-ON", "SIGN-OFF", "REMARKS"],
    ];

    // --- Flatten crew + movements ---
    const tableRows: any[][] = [];
    crewData.forEach((crew) => {
      crew.Movements.forEach((movement) => {
        const crewName = `${crew.LastName}, ${crew.FirstName} ${
          crew.MiddleName ? crew.MiddleName : ""
        }`.trim();

        tableRows.push([
          crewName,
          movement.VesselName || "",
          movement.OnboardDate
            ? format(new Date(movement.OnboardDate), "yyyy-MM-dd")
            : "",
          movement.OffboardDate
            ? format(new Date(movement.OffboardDate), "yyyy-MM-dd")
            : "",
          movement.Remarks || "",
        ]);
      });
    });

    // --- Combine header + table ---
    const rows = [...headerRows, ...tableHeader, ...tableRows];

    // --- Create worksheet ---
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Auto column widths
    const dataRows = rows.slice(7);
    const colWidths = dataRows[0]?.map((_: any, colIndex: number) => {
        const maxLength = dataRows.reduce((max, row) => {
            const val = row[colIndex] ? row[colIndex].toString() : "";
            return Math.max(max, val.length);
        }, 10);
        return { wch: maxLength + 2 };
    }) || [];

    if (colWidths[1]) colWidths[1].wch = Math.max(colWidths[1].wch, 40);
    
    worksheet["!cols"] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MovementHistory");

    // File name
    const fileName =
      mode === "vessel"
        ? `VesselMovement_${month}-${year}.xlsx`
        : `VesselMovement_ALL_${month}-${year}.xlsx`;

    // Export to file
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error generating Excel:", error);
  }
}

