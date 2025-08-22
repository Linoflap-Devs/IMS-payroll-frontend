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

// Get surname for grouping
function getSurname(crew: CrewMovementHistory): string {
    return crew.LastName?.toUpperCase() ?? "";
}

// Build one worksheet with header + data
function buildWorksheet(title: string, crewList: CrewMovementHistory[], month: number, year: number) {
    const rows: any[] = [];

    const now = new Date();
    const dateStr = format(now, "MM/dd/yy hh:mm a");

    // HEADER
    rows.push(["IMS PHILIPPINES"]);
    rows.push(["MARITIME CORP."]);
    rows.push([`${getMonthName(month)} ${year}`]);
    rows.push(["CREW MOVEMENT HISTORY"]);
    rows.push([`Generated: ${dateStr}`]);
    rows.push([]);
    rows.push(["Crew Code", "Crew Name", "Vessel Name", "Rank", "Sign On Date", "Sign Off Date", "Remarks"]);

    // DATA
    crewList.forEach((crew) => {
        if (crew.Movements && crew.Movements.length > 0) {
            crew.Movements.forEach((movement, idx) => {
                rows.push([
                    idx === 0 ? crew.CrewCode : "",
                    idx === 0 ? `${crew.LastName}, ${crew.FirstName} ${crew.MiddleName ?? ""}` : "",
                    movement.VesselName,
                    movement.Rank,
                    movement.OnboardDate ? format(new Date(movement.OnboardDate), "yyyy-MM-dd") : "-",
                    movement.OffboardDate ? format(new Date(movement.OffboardDate), "yyyy-MM-dd") : "-",
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

        // Add blank row after each crew to create spacing
        rows.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

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
    ws["!cols"] = colWidths;

    return ws;
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

    // Sorting by LastName ASC
    const sortedData = [...crewData].sort((a, b) => a.LastName.localeCompare(b.LastName));

    const workbook = XLSX.utils.book_new();

    // Sheet ranges
    const groups = [
        { name: "A to C", regex: /^[A-C]/i },
        { name: "D to L", regex: /^[D-L]/i },
        { name: "M to R", regex: /^[M-R]/i },
        { name: "S to Z", regex: /^[S-Z]/i },
    ];

    groups.forEach(({ name, regex }) => {
        const filtered = sortedData.filter((crew) => regex.test(getSurname(crew)));
        if (filtered.length > 0) {
            const ws = buildWorksheet(name, filtered, month, year);
            XLSX.utils.book_append_sheet(workbook, ws, name);
        }
    });

    // Temporarily removed "in-active" sheet since no Status field

    // Masterlist (only if ALL)
    if (sortedData.length > 1) {
        const ws = buildWorksheet("masterlist", sortedData, month, year);
        XLSX.utils.book_append_sheet(workbook, ws, "masterlist");
    }

    const fileName = sortedData.length > 1
        ? `MovementHistory_ALL_${getMonthName(month)}-${year}.xlsx`
        : `MovementHistory_${sortedData[0].LastName}_${sortedData[0].FirstName}_${getMonthName(month)}-${year}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}
