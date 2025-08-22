import * as XLSX from "xlsx";
import { format } from "date-fns";
import { CrewMovementHistory } from "@/src/services/crew/crew.api";

function getMonthName(monthNum: number): string {
    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
    ];
    return months[monthNum - 1];
}

export function generateMovementHistoryExcel(
    crewData: CrewMovementHistory[],
    month: number,
    year: number
): void {
    if (!crewData || crewData.length === 0) {
        console.error("Invalid or empty data for movement history");
        return;
    }

    const rows: any[] = [];

    // HEADER ROWS
    const now = new Date();
    const dateStr = format(now, "MM/dd/yy hh:mm a"); // e.g. 08/22/25 2:21 PM
    rows.push(["IMS PHILIPPINES"]);
    rows.push(["MARITIME CORP."]);
    rows.push([`${getMonthName(month)} ${year}`]);
    rows.push(["CREW MOVEMENT HISTORY"]);
    // rows.push([
    //     `VESSEL: ALL VESSELS`,
    //     "",
    //     "",
    //     "",
    //     "",
    //     "",
    //     `CREW: ${crewData[0].LastName}, ${crewData[0].FirstName} ${crewData[0].MiddleName ?? ""}`,
    // ]);
    rows.push([`Generated: ${dateStr}`]);
    rows.push([]); // empty row before table

    // TABLE HEADERS
    rows.push([
        "Crew Code",
        "Crew Name",
        "Vessel Name",
        "Rank",
        "Sign On Date",
        "Sign Off Date",
        "Remarks",
    ]);

    // TABLE DATA
    crewData.forEach((crew) => {
        if (crew.Movements && crew.Movements.length > 0) {
            crew.Movements.forEach((movement, idx) => {
                rows.push([
                    idx === 0 ? crew.CrewCode : "",
                    idx === 0
                        ? `${crew.LastName}, ${crew.FirstName} ${crew.MiddleName ?? ""}`
                        : "",
                    movement.VesselName,
                    movement.Rank,
                    movement.OnboardDate
                        ? format(new Date(movement.OnboardDate), "yyyy-MM-dd")
                        : "-",
                    movement.OffboardDate
                        ? format(new Date(movement.OffboardDate), "yyyy-MM-dd")
                        : "-",
                    movement.Remarks ?? "",
                ]);
            });
        } else {
            rows.push([
                crew.CrewCode,
                `${crew.LastName}, ${crew.FirstName} ${crew.MiddleName ?? ""}`,
                "-",
                crew.Rank,
                "-",
                "-",
                "",
            ]);
        }
    });

    // Create worksheet from full rows
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Auto column widths (based on table data only)
    const dataRows = rows.slice(8); // skip header rows
    const colWidths = dataRows[0].map((_: any, colIndex: number) => {
        const maxLength = dataRows.reduce((max, row) => {
            const val = row[colIndex] ? row[colIndex].toString() : "";
            return Math.max(max, val.length);
        }, 10); // 10 = minimum width
        return { wch: maxLength + 1 }; // +2 padding
    });

    // Force Crew Name column (index 1) wider
    colWidths[1] = { wch: Math.max(colWidths[1].wch, 40) }; // at least 40 chars wide

    worksheet["!cols"] = colWidths;


    // Assume you have 8 columns (adjust according to your data)
    const totalCols = colWidths.length;
    const lastCol = String.fromCharCode(65 + totalCols - 1); // e.g., "H" if 8 cols

    // Merge header rows
    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }, // IMS PHILIPPINES
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } }, // MARITIME CORP.
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } }, // (etc. adjust as needed)
    ];

    // Optional: apply alignment style (center text)
    ["A1", "A2", "A3"].forEach((cell) => {
        if (worksheet[cell]) {
            worksheet[cell].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: { bold: true, sz: 14 }, // bold + bigger font
            };
        }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MovementHistory");

    const fileName =
        crewData.length > 1
            ? `MovementHistory_ALL_${getMonthName(month)}-${year}.xlsx`
            : `MovementHistory_${crewData[0].LastName}_${crewData[0].FirstName}_${getMonthName(
                month
            )}-${year}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}
