"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";
import { capitalizeFirstLetter, truncateText } from "@/lib/utils";
import { Deductions } from "@/src/services/payroll/payroll.api";
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

// Format currency values with commas and 2 decimal places
function formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numAmount);
}

// Get formatted date string (MM/DD/YY H:MM AM/PM)
function getFormattedDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

function getMonthName(monthNum: number): string {
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return months[monthNum - 1];
}

/**
 * Generate allotment payroll register PDF directly from AllotmentRegisterData array
 * @param vesselData Array of vessel data
 * @param month Month name in uppercase (e.g., "JANUARY")
 * @param year Year (e.g., 2025)
 * @param exchangeRate Exchange rate for USD to PHP
 * @returns boolean indicating if PDF generation was successful
 */
export function generateMovementHistory(
    crewData: CrewMovementHistory[],
    month: number,
    year: number,
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!crewData || crewData.length === 0) {
        console.error('Invalid or empty data for allotment register');
        return false;
    }

    try {

        const periodMonth = getMonthName(month);
        const periodYear = year;
        
        // Create a single PDF document for all vessels
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "legal" // Legal size (8.5" × 14")
        });

        // Add the custom font with peso symbol support
        try {
            addFont(doc);
            doc.setFont('NotoSans', 'normal');
        } catch (error) {
            console.warn("Could not load custom font, using default", error);
            doc.setFont('helvetica', 'normal');
        }

        // Set document properties
        doc.setProperties({
            title: `Movement History - ${month} ${year}`,
            subject: `Movement History`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Page dimensions and constants
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = { left: 10, right: 10, top: 10, bottom: 20 }; // Reduced bottom margin

        const mainTableWidth = pageWidth - margins.left - margins.right;

        // Define table column widths for the main data table
        const colWidths = [
            mainTableWidth * 0.10, // CREW CODE
            mainTableWidth * 0.30, // CREW NAME
            mainTableWidth * 0.15, // Vessel name
            mainTableWidth * 0.10, // Rank
            mainTableWidth * 0.10, // Onboard Date
            mainTableWidth * 0.10, // Offboard Date
            mainTableWidth * 0.15, // Remarks
        ];

        // Calculate total table width and scale if needed
        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        const scaleFactor = (pageWidth - margins.left - margins.right) / totalWidth;

        // Calculate column positions
        const colPositions: number[] = [];
        let runningPosition = margins.left;
        colWidths.forEach(width => {
            colPositions.push(runningPosition);
            runningPosition += width * scaleFactor;
        });
        colPositions.push(runningPosition); // Add end position

        // Define heights
        const headerHeight = 16;
        const vesselInfoHeight = 16;
        const tableHeaderHeight = 10;
        const rowHeight = 8;

        // Keep track of pagination
        let currentPage = 1;

        // Variables to track current position
        let currentY = margins.top;
        let isFirstPage = true;

        // Function to add headers to a page
        function addPageHeaders(vessel: CrewMovementHistory, withTableHeader: boolean = true): void {
            // If not the first page, add a new page
            if (!isFirstPage) {
                doc.addPage();
                currentPage++;
                currentY = margins.top;
            } else {
                isFirstPage = false;
            }

            // Draw header table (3-column structure)
            const headerWidth = pageWidth - margins.left - margins.right;
            const companyColWidth = 90;
            const middleColWidth = headerWidth - companyColWidth - 100;
            const rightColWidth = 100;

            // Draw header table borders
            doc.setLineWidth(0.1);
            doc.setDrawColor(0);

            // Header rect for company info
            doc.rect(margins.left, currentY, headerWidth, headerHeight);

            // Right column boxes for month/year and report title
            doc.rect(margins.left + companyColWidth + middleColWidth, currentY, rightColWidth, 8); // Month/Year cell
            doc.rect(margins.left + companyColWidth + middleColWidth, currentY + 8, rightColWidth, 8); // Report Title cell

            // Add IMS Philippines logo
            doc.addImage(logoBase64Image, 'PNG', margins.left, currentY, 16, 16);

            // Add company name text
            doc.setFontSize(9);
            doc.setFont('NotoSans', 'bold');
            doc.text("IMS PHILIPPINES", margins.left + 23, currentY + 7.5);
            doc.text("MARITIME CORP.", margins.left + 23, currentY + 11.5);

            // Add month/year and report title
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');
            doc.text(`${periodMonth} ${year}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, currentY + 5, { align: 'right' });
            doc.text("CREW MOVEMENT HISTORY", margins.left + companyColWidth + middleColWidth + rightColWidth - 5, currentY + 13, { align: 'right' });

            currentY += headerHeight;

            // Draw vessel information table
            const vesselInfoY = currentY;

            // Main rectangle for vessel info
            doc.rect(margins.left, vesselInfoY, headerWidth, vesselInfoHeight);

            // Vessel name info
            doc.setFontSize(7);
            doc.setTextColor(130);
            doc.setFont('NotoSans', 'italic');
            doc.setTextColor(0);
            doc.text("CREW", margins.left + 2, vesselInfoY + 3);
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'bold');
            doc.text('ALL CREWS', margins.left + 2, vesselInfoY + 6.5);

            // Vertical line for right column
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(margins.left + companyColWidth + middleColWidth, vesselInfoY, margins.left + companyColWidth + middleColWidth, vesselInfoY + vesselInfoHeight);

            // IMPORTANT: Add horizontal line between exchange rate and date
            doc.line(margins.left, vesselInfoY + 8, margins.left + companyColWidth + middleColWidth + rightColWidth, vesselInfoY + 8);

            // Add exchange rate and date
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');
            doc.text(`${vessel.LastName}, ${vessel.FirstName} ${vessel.MiddleName ? vessel.MiddleName : ''}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 5, { align: 'right' });
            doc.text(getFormattedDate(), margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 13, { align: 'right' });

            currentY += vesselInfoHeight;

            // Add gray separator line (simplified - no vessel header)
            doc.setDrawColor(180);
            doc.setLineWidth(1);
            doc.line(margins.left, currentY + 4, pageWidth - margins.right, currentY + 4);
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);

            currentY += 8; // Just space for the separator

            if(withTableHeader){

                // Draw table header
                doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
                doc.setFillColor(235, 235, 235); // Light gray background
                doc.rect(margins.left, currentY, pageWidth - 20, tableHeaderHeight, "FD"); // Header row background
    
                // Draw header text
                const headers = [
                    "CREW CODE", "CREW NAME", "VESSEL NAME", "RANK", "SIGN ON DATE", "SIGN OFF DATE", "REMARKS"
                ];
    
                doc.setFontSize(7);
                doc.setFont('NotoSans', 'normal');
                headers.forEach((header, index) => {
                    const colWidth = colWidths[index] * scaleFactor;
                    const colX = colPositions[index];
                    doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' });
                    //  if (index <= 1) {
                    //     // Left align crew name header (same as data)
                    // }
                    // else if(header === "ALLOTTEE NAME" || header === "BANK"){
                    //     doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' });
                    // } 
                    // else {
                    //     // Right align numeric headers (same as data)
                    //     doc.text(header, colX + colWidth - 5, currentY + tableHeaderHeight / 2 + 1, { align: 'right' });
                    // }
                });
    
                // Draw horizontal line after headers
                doc.line(margins.left, currentY + tableHeaderHeight, pageWidth - margins.right, currentY + tableHeaderHeight);
    
                currentY += tableHeaderHeight;
            }
        }

        // Function to add a footer to the current pages
        function addPageFooter(currentPage: number, totalPages: number): void {
            // Draw page number box at bottom
            doc.rect(margins.left, pageHeight - margins.bottom + 3, pageWidth - margins.left - margins.right, 8);
            doc.setFontSize(7);
            doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 6, pageHeight - margins.bottom + 8, { align: 'right' });
        }

        // Process each vessel - without adding vessel header between vessels
        crewData.forEach((crew, crewIndex) => {
            // On new vessel, always start with headers
            if (crewIndex === 0 || !isFirstPage) {
                addPageHeaders(crew);
            }

            // Draw table data rows
            let y = currentY;
            let tableStartY = currentY; // Start of current table section

            // Calculate how much space this crew entry will need
            const movementCount = crew.Movements ? crew.Movements.length : 0;
            const crewEntryHeight = rowHeight + (movementCount * rowHeight);

            // // Check if we need a new page
            // if (y + crewEntryHeight > pageHeight - margins.bottom - 8) {
            //     // Draw vertical lines on left and right sides of the table for this page
            //     doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
            //     doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                

            //     // Start a new page with headers
            //     addPageHeaders(crew);

            //     // Reset table position trackers for new page
            //     y = currentY;
            //     tableStartY = currentY;
            // }

            // Set font for data
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');

            const columnKeys: string[] = [
                "CrewCode",
                "CrewName"
            ];

            // Draw crew data
            columnKeys.forEach((key: any, i) => {
                //console.log(crew)
                if(key === 'CrewName') {
                    const name = `${crew.LastName.toUpperCase()}, ${crew.FirstName.toUpperCase()} ${crew.MiddleName ? crew.MiddleName + ' ' : ''}`;
                    doc.text(name, colPositions[i] + 5, y + 5, {align: 'left'});
                }
                else if(i <= 1) {
                    // Crew Name
                    let value = null;
                    if(crew[key as keyof CrewMovementHistory]) {
                        value = `${crew[key as keyof CrewMovementHistory]}`;
                    }
                    else {
                        value = ''
                    }
                    doc.text(value, colPositions[i] + 5, y + 5, {align: 'left'});
                }
            });

            // Draw horizontal line at bottom of crew row
            doc.line(margins.left, y + rowHeight, pageWidth - margins.right, y + rowHeight);

            // Move to next row
            y += rowHeight;
            currentY = y

            // If crew has allottees, draw them in subsequent rows
            if (crew.Movements && crew.Movements.length > 0) {
                crew.Movements.forEach(movement => {
                    // Check if we need a new page for this allottee
                    if (y + rowHeight > pageHeight - margins.bottom - 8) {
                        // Draw vertical lines on left and right sides of the table for this page
                        doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
                        doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                        

                        // Start a new page with headers
                        addPageHeaders(crew);

                        // Reset table position trackers for new page
                        y = currentY;
                        tableStartY = currentY;
                    }

                    const columnKeys: string[] = [
                        "VesselName",
                        "Rank",
                        "OnboardDate",
                        "OffboardDate",
                        "Remarks"
                    ];

                    // Draw crew data
                    columnKeys.forEach((key: any, i) => {
                        if( key === 'OnboardDate' || key === 'OffboardDate') {
                            const date = movement[key as keyof Movement];
                            const formattedDate = date ? format(new Date(date), "yyyy-MM-dd") : "-";
                            doc.text(formattedDate, colPositions[i + 2] + 5, y + 5, {align: 'left'});
                        }
                        else if (key === 'Remarks') {
                            doc.setFont('NotoSans', 'italic');
                            const remarks = movement[key as keyof Movement] ? movement[key as keyof Movement]?.toString() : '';
                            doc.text(remarks || '', colPositions[i + 2] + 5, y + 5, {align: 'left'});
                            doc.setFont('NotoSans', 'normal');
                        }
                        else {
                            // Crew Name
                            let value = null;
                            if(movement[key as keyof Movement]) {
                                value = `${movement[key as keyof Movement]}`;
                            }
                            else {
                                value = ''
                            }
                            doc.text(value, colPositions[i + 2] + 5, y + 5, {align: 'left'});
                        }
                    });


                    // Move to next row
                    y += rowHeight;
                });
            }
            doc.line(margins.left, y, pageWidth - margins.right, y);


            // Draw vertical lines on left and right sides of the table for the last section
            doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
            doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

            // // ADD VESSEL SUMMARY HERE
            // // Check if we need a new page for the summary
            // const estimatedSummaryHeight = 100; // Rough estimate
            // if (y + estimatedSummaryHeight > pageHeight - margins.bottom - 8) {
            //     addPageHeaders(vessel, false);
            //     y = currentY;
            // }
            
            // // Draw the vessel summary
            // y = drawVesselSummary(doc, vessel, y, margins, pageWidth, colPositions, colWidths, scaleFactor);
            // currentY = y;

            // If there are more vessels, prepare for the next vessel
            if (crewIndex < crewData.length - 1) {
                isFirstPage = false;
            }
        });

       // NOW ADD PAGE NUMBERS TO ALL PAGES - Get actual total pages
        const totalPages = doc.internal.pages.length - 1; // Subtract 1 because pages array includes a blank first element

        // Loop through all pages and add page numbers
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'italic');
            // Draw page number box at bottom
            addPageFooter(i, totalPages)
        }
        // Save the final PDF
        const fileName = crewData.length > 1
                    ? `MovementHistory_ALL_${capitalizeFirstLetter(getMonthName(month))}-${year}.pdf`
                    : `MovementHistory_${capitalizeFirstLetter(crewData[0].LastName.replace(' ', '-'))}-${capitalizeFirstLetter(crewData[0].FirstName.replace(' ', '-'))}_${capitalizeFirstLetter(getMonthName(month))}-${year}.pdf`;
        doc.save(fileName)
        return true;
    } catch (error) {
        console.error("Error generating PDF:", error);
        return false;
    }
}

// Helper function to convert data URI to Blob
function dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

// Example usage function
export function generateMovementHistoryPDF(
    crewData: CrewMovementHistory[],
    month: number,
    year: number,
): void {
    generateMovementHistory(crewData, month, year);
}
