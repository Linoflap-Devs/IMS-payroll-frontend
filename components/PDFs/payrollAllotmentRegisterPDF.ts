"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";

// Define interfaces based on your updated data structure
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
    Crew: AllotmentRegisterCrew[];
}

export interface AllotmentRegisterResponse {
    success: boolean;
    message: string;
    data: AllotmentRegisterData[];
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

/**
 * Generate allotment payroll register PDF directly from AllotmentRegisterData array
 * @param vesselData Array of vessel data
 * @param month Month name in uppercase (e.g., "JANUARY")
 * @param year Year (e.g., 2025)
 * @param exchangeRate Exchange rate for USD to PHP
 * @param currentUser Current user's login name
 * @returns boolean indicating if PDF generation was successful
 */
export function generateAllotmentPayrollRegister(
    vesselData: AllotmentRegisterData[],
    month: string,
    year: number,
    exchangeRate: number,
    // currentUser: string = 'lanceballicud'
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!vesselData || vesselData.length === 0) {
        console.error('Invalid or empty data for allotment register');
        return false;
    }

    try {
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
            title: `Allotment Payroll Register - ${month} ${year}`,
            subject: `Allotment Payroll Register`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Page dimensions and constants
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = { left: 10, right: 10, top: 10, bottom: 30 };
        // const maxContentHeight = pageHeight - margins.top - margins.bottom;

        // Define table column widths for the main data table
        const colWidths = [
            55,  // CREW NAME
            30,  // RANK
            28,  // BASIC WAGE
            22,  // FIXED OT
            24,  // GUAR OT
            28,  // DOLLAR GROSS
            28,  // PESO GROSS
            30,  // TOTAL DED
            30,  // NET
            48,  // ALLOTTEE NAME
            38,  // ACCOUNT NUMBER
            38,  // BANK
            40   // ALLOTMENT
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
        let totalPages = 0; // Will calculate after processing

        // Variables to track current position
        let currentY = margins.top;
        let isFirstPage = true;
        // Function to add headers to a page (company info, vessel info, table headers)
        function addPageHeaders(vessel: AllotmentRegisterData, isNewVessel: boolean = false): void {

            // If not the first page of the first vessel, add a new page
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
            doc.text(`${month} ${year}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, currentY + 5, { align: 'right' });
            doc.text("ALLOTMENT PAYROLL REGISTER", margins.left + companyColWidth + middleColWidth + rightColWidth - 5, currentY + 13, { align: 'right' });

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
            doc.text("VESSEL", margins.left + 2, vesselInfoY + 3);
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'bold');
            doc.text(vessel.VesselName, margins.left + 2, vesselInfoY + 6.5);

            // Vertical line for right column
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(margins.left + companyColWidth + middleColWidth, vesselInfoY, margins.left + companyColWidth + middleColWidth, vesselInfoY + vesselInfoHeight);

            // IMPORTANT: Add horizontal line between exchange rate and date
            doc.line(margins.left, vesselInfoY + 8, margins.left + companyColWidth + middleColWidth + rightColWidth, vesselInfoY + 8);

            // Add exchange rate and date
            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');
            doc.text(`EXCHANGE RATE: USD > PHP ${exchangeRate}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 5, { align: 'right' });
            doc.text(getFormattedDate(), margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 13, { align: 'right' });

            currentY += vesselInfoHeight;

            // Add "VESSEL: [VesselName]" header if this is a new vessel (not for continued pages)
            if (isNewVessel) {
                // Horizontal gray separator line
                doc.setDrawColor(180); // Gray color
                doc.setLineWidth(1);
                doc.line(margins.left, currentY + 4, pageWidth - margins.right, currentY + 4);
                doc.setDrawColor(0); // Reset to black
                doc.setLineWidth(0.1);

                // Add vessel header
                doc.setFillColor(220, 220, 220); // Light gray background
                doc.rect(margins.left, currentY + 8, headerWidth, 8, "FD");
                doc.setFontSize(8);
                doc.setFont('NotoSans', 'bold');
                doc.text(`VESSEL: ${vessel.VesselName} (ID: ${vessel.VesselID})`, margins.left + 4, currentY + 13);

                currentY += 16; // Space for separator + vessel header
            } else {
                // Just add the gray separator
                doc.setDrawColor(180);
                doc.setLineWidth(1);
                doc.line(margins.left, currentY + 4, pageWidth - margins.right, currentY + 4);
                doc.setDrawColor(0);
                doc.setLineWidth(0.1);

                currentY += 8; // Space for separator only
            }

            // Draw table header
            doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
            doc.setFillColor(235, 235, 235); // Light gray background
            doc.rect(margins.left, currentY, pageWidth - 20, tableHeaderHeight, "FD"); // Header row background

            // Draw header text
            const headers = [
                "CREW NAME", "RANK", "BASIC WAGE", "FIXED OT", "GUAR OT", "DOLLAR GROSS",
                "PESO GROSS", "TOTAL DED.", "NET", "ALLOTTEE NAME", "ACCOUNT NUMBER", "BANK", "ALLOTMENT"
            ];

            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');
            headers.forEach((header, index) => {
                const colWidth = colWidths[index] * scaleFactor;
                const colX = colPositions[index];
                doc.text(header, colX + colWidth / 2, currentY + 6, { align: 'center' });
            });

            // Draw horizontal line after headers
            doc.line(margins.left, currentY + tableHeaderHeight, pageWidth - margins.right, currentY + tableHeaderHeight);

            currentY += tableHeaderHeight;
        }

        // Function to add a footer to the current page
        function addPageFooter(): void {
            // Draw page number box at bottom
            doc.rect(margins.left, pageHeight - margins.bottom + 13, pageWidth - margins.left - margins.right, 8);
            doc.setFontSize(7);
            doc.text(`Page ${currentPage} out of #{TOTAL_PAGES}#`, pageWidth - margins.right - 6, pageHeight - margins.bottom + 18, { align: 'right' });

            // No more footer text with date/time and user as requested
        }

        // Process each vessel
        vesselData.forEach((vessel, vesselIndex) => {
            // Add headers for first page or when continuing to a new vessel
            addPageHeaders(vessel, true);

            // Draw table data rows
            let y = currentY;
            let tableStartY = currentY; // Start of current table section

            // Process each crew member
            vessel.Crew.forEach((crew) => {
                // Calculate how much space this crew entry will need
                const allotteeCount = crew.Allottee ? crew.Allottee.length : 0;
                const crewEntryHeight = rowHeight + (allotteeCount * rowHeight);

                // Check if we need a new page
                if (y + crewEntryHeight > pageHeight - margins.bottom - 8) {
                    // Draw vertical lines on left and right sides of the table for this page
                    doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
                    doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                    // Add footer to current page
                    addPageFooter();

                    // Start a new page with headers (but not as new vessel)
                    addPageHeaders(vessel, false);

                    // Reset table position trackers for new page
                    y = currentY;
                    tableStartY = currentY;
                }

                // Set font for data
                doc.setFontSize(7);
                doc.setFont('NotoSans', 'normal');

                // Draw crew data
                doc.text(crew.CrewName, colPositions[0] + 6, y + 5, { align: 'left' });
                doc.text(crew.Rank, colPositions[1] + 9, y + 5, { align: 'left' });
                doc.text(formatCurrency(crew.BasicWage), colPositions[2] + colWidths[2] * scaleFactor, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.FixedOT), colPositions[3] + colWidths[3] * scaleFactor - 5, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.GuarOT), colPositions[4] + colWidths[4] * scaleFactor - 5, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.DollarGross), colPositions[5] + colWidths[5] * scaleFactor - 5, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.PesoGross), colPositions[6] + colWidths[6] * scaleFactor - 5, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.TotalDeduction), colPositions[7] + colWidths[7] * scaleFactor - 5, y + 5, { align: 'right' });
                doc.text(formatCurrency(crew.Net), colPositions[8] + colWidths[8] * scaleFactor - 5, y + 5, { align: 'right' });

                // Draw horizontal line at bottom of crew row
                doc.line(margins.left, y + rowHeight, pageWidth - margins.right, y + rowHeight);

                // Move to next row
                y += rowHeight;

                // If crew has allottees, draw them in subsequent rows
                if (crew.Allottee && crew.Allottee.length > 0) {
                    crew.Allottee.forEach(allottee => {
                        // Check if we need a new page for this allottee
                        if (y + rowHeight > pageHeight - margins.bottom - 8) {
                            // Draw vertical lines on left and right sides of the table for this page
                            doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
                            doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                            // Add footer to current page
                            addPageFooter();

                            // Start a new page with headers
                            addPageHeaders(vessel, false);

                            // Reset table position trackers for new page
                            y = currentY;
                            tableStartY = currentY;
                        }

                        // Add allottee details - using the updated property names
                        doc.text(allottee.AllotteeName, colPositions[9] + 4, y + 5, { align: 'left' });
                        doc.text(allottee.AccountNumber, colPositions[10] + 9, y + 5, { align: 'left' });
                        doc.text(allottee.Bank, colPositions[11] + 4, y + 5, { align: 'left' });
                        doc.text(formatCurrency(allottee.NetAllotment), colPositions[12] + colWidths[12] * scaleFactor - 6, y + 5, { align: 'right' });

                        // Draw horizontal line at bottom of allottee row

                        // Move to next row
                        y += rowHeight;
                    });

                }
                doc.line(margins.left, y, pageWidth - margins.right, y);

            });

            // Draw vertical lines on left and right sides of the table for the last section
            doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
            doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

            // Add footer to the last page of this vessel
            addPageFooter();

            // If there are more vessels, prepare for the next one
            if (vesselIndex < vesselData.length - 1) {
                isFirstPage = false;
            }
        });

        // Set total pages count (replace placeholder)
        totalPages = currentPage;
        const pdfText = doc.output('datauristring');
        const updatedPdfText = pdfText.replace(/#{TOTAL_PAGES}#/g, totalPages.toString());

        // Save the final PDF
        const fileName = `allotment-payroll-register-multiple-vessels-${month.toLowerCase()}-${year}.pdf`;

        // Save the PDF using the updated content with correct page numbers
        const blob = dataURItoBlob(updatedPdfText);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);

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
export function generateAllotmentPDF(
    allotmentData: AllotmentRegisterData[],
    month: string,
    year: number,
    exchangeRate: number,
): void {
    generateAllotmentPayrollRegister(allotmentData, month, year, exchangeRate);
}