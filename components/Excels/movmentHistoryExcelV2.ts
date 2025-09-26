"use client";

import * as XLSX from "xlsx";
import { format } from "date-fns";
import { capitalizeFirstLetter } from "@/lib/utils";

export interface Movement {
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

export interface VesselMovementHistory {
  VesselName: string;
  CrewList: CrewMovementHistory[];
}

export async function generateMovementHistoryExcelV2(
  vesselData: VesselMovementHistory[],
  month: number,
  year: number,
  currentDate: Date,
  mode: "all" | "vessel" = "all"
): Promise<void> {
  if (!vesselData || vesselData.length === 0) {
    console.error("Invalid or empty data for Excel export");
    return;
  }

  // Count total movements
  const totalMovements = vesselData.reduce(
    (sum, vessel) =>
      sum +
      vessel.CrewList.reduce(
        (crewSum, crew) => crewSum + crew.Movements.length,
        0
      ),
    0
  );

  // Flatten data into rows
  const rows: any[] = [];
  vesselData.forEach((vessel) => {
    vessel.CrewList.forEach((crew) => {
      crew.Movements.forEach((movement) => {
        rows.push({
          "Crew Name": `${crew.LastName.toUpperCase()}, ${crew.FirstName.toUpperCase()} ${
            crew.MiddleName ?? ""
          }`,
          Vessel: vessel.VesselName,
          Rank: crew.Rank,
          "Sign-On": movement.OnboardDate
            ? format(movement.OnboardDate, "yyyy-MM-dd")
            : "",
          "Sign-Off": movement.OffboardDate
            ? format(movement.OffboardDate, "yyyy-MM-dd")
            : "",
          Remarks: movement.Remarks || "",
        });
      });
    });
  });

  // Create header rows (each will occupy one row in Excel)
  const headerRows = [
    ["IMS PHILIPPINES"],
    ["MARITIME CORP."],
    [
      `${capitalizeFirstLetter(
        format(new Date(year, month - 1), "MMMM")
      )} ${year}`,
    ],
    ["VESSEL MOVEMENT RECORD"],
    [
      "VESSEL",
      mode === "vessel" && vesselData.length === 1
        ? vesselData[0].VesselName
        : "ALL VESSELS",
      `${totalMovements} MOVEMENTS`,
    ],
    [format(currentDate, "yyyy-MM-dd hh:mm a")],
    [], // blank row before table
  ];

  // Start sheet with header
  const worksheet = XLSX.utils.aoa_to_sheet(headerRows);

  // Add data rows below header (starting at row 8)
  XLSX.utils.sheet_add_json(worksheet, rows, { origin: "A8" });

  // 🔹 Auto width for columns
  const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 }); // convert to 2D array
  const headers = sheetData[7]; // row where your actual table headers are (Crew Name, Vessel, Rank...)
  const colWidths = headers.map((header: string, colIndex: number) => {
    const maxLength = sheetData.reduce((max, row) => {
      const cell = row[colIndex] ? row[colIndex].toString() : "";
      return Math.max(max, cell.length);
    }, 10);

    if (header === "Remarks") return { wch: maxLength + 10 }; // make Remarks wider
    if (header === "Crew Name") return { wch: maxLength + 10 }; // give extra room
    return { wch: maxLength + 5 };
  });
  worksheet["!cols"] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movements");

  // File name
  const formattedDate = format(currentDate, "yyyyMMdd");
  const fileName =
    mode === "vessel" && vesselData.length === 1
      ? `VesselMovement_${capitalizeFirstLetter(
          vesselData[0].VesselName || "UnknownVessel"
        )}_${month}-${year}_${formattedDate}.xlsx`
      : `VesselMovement_ALL_${month}-${year}_${formattedDate}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
