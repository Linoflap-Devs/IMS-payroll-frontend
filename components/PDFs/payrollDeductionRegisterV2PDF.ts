"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";
import { truncateText } from "@/lib/utils";
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
export function generateDeductionAllotmentV2Register(
    vesselData: DeductionRegisterData[],
    month: number,
    year: number,
    exchangeRate: number,
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
            title: `Allotment Deduction Register - ${month} ${year}`,
            subject: `Alltoment Deduction Register`,
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
            mainTableWidth * 0.20, // CREW NAME
            mainTableWidth * 0.14, // RANK
            mainTableWidth * 0.09, // SALARY
            mainTableWidth * 0.10, // GROSS
            mainTableWidth * 0.50  // Deduction details
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
        function addPageHeaders(vessel: DeductionRegisterData): void {
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
            doc.text("ALLOTMENT DEDUCTION REGISTER", margins.left + companyColWidth + middleColWidth + rightColWidth - 5, currentY + 13, { align: 'right' });

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
            doc.text(`EXCHANGE RATE: USD 1.00 = PHP ${vesselData[0].Crew[0].Deductions[0].ExchangeRate.toFixed(2)}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 5, { align: 'right' });
            doc.text(getFormattedDate(), margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 13, { align: 'right' });

            currentY += vesselInfoHeight;

            // Add gray separator line (simplified - no vessel header)
            doc.setDrawColor(180);
            doc.setLineWidth(1);
            doc.line(margins.left, currentY + 4, pageWidth - margins.right, currentY + 4);
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);

            currentY += 8; // Just space for the separator

            // Draw table header
            doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
            doc.setFillColor(235, 235, 235); // Light gray background
            doc.rect(margins.left, currentY, pageWidth - 20, tableHeaderHeight, "FD"); // Header row background

            // Draw header text
            const headers = [
                "CREW NAME", "RANK", "SALARY", "GROSS"
            ];

            doc.setFontSize(7);
            doc.setFont('NotoSans', 'normal');
            headers.forEach((header, index) => {
                const colWidth = colWidths[index] * scaleFactor;
                const colX = colPositions[index];
                 if (index <= 1) {
                    // Left align crew name header (same as data)
                    doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' });
                }
                else if(header === "ALLOTTEE NAME" || header === "BANK"){
                    doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' });
                } 
                else {
                    // Right align numeric headers (same as data)
                    doc.text(header, colX + colWidth - 5, currentY + tableHeaderHeight / 2 + 1, { align: 'right' });
                }
            });

            // Draw horizontal line after headers
            doc.line(margins.left, currentY + tableHeaderHeight, pageWidth - margins.right, currentY + tableHeaderHeight);

            currentY += tableHeaderHeight;
        }

        // Function to add a footer to the current pages
        function addPageFooter(currentPage: number, totalPages: number): void {
            // Draw page number box at bottom
            //console.log(pageHeight, margins.bottom);
            doc.rect(margins.left, pageHeight - margins.bottom + 3, pageWidth - margins.left - margins.right, 8);
            doc.setFontSize(7);
            doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 6, pageHeight - margins.bottom + 8, { align: 'right' });
        }

        // Process each vessel - without adding vessel header between vessels
        vesselData.forEach((vessel, vesselIndex) => {
            // On new vessel, always start with headers
            if (vesselIndex === 0 || !isFirstPage) {
                addPageHeaders(vessel);
            }

            // Draw table data rows
            let y = currentY;
            let tableStartY = currentY; // Start of current table section

            // Process each crew member
            vessel.Crew.forEach((crew) => {
                // Calculate how much space this crew entry will need
                const allotteeCount = crew.Deductions ? crew.Deductions.length : 0;
                const crewEntryHeight = rowHeight + (allotteeCount * rowHeight);

                // Check if we need a new page
                if (y + crewEntryHeight > pageHeight - margins.bottom - 8) {
                    // Draw vertical lines on left and right sides of the table for this page
                    doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
                    doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                    

                    // Start a new page with headers
                    addPageHeaders(vessel);

                    // Reset table position trackers for new page
                    y = currentY;
                    tableStartY = currentY;
                }

                // Set font for data
                doc.setFontSize(7);
                doc.setFont('NotoSans', 'normal');

                 const columnKeys: string[] = [
                    "CrewName",
                    "Rank",
                    "Salary",
                    "Gross",
                ];

                // Draw crew data
                columnKeys.forEach((key, i) => {
                    if(i == 0) {
                        // Crew Name
                        doc.text(truncateText(crew[key as keyof DeductionRegisterCrew].toString(), 32), colPositions[0] + 5, y + 5, {align: 'left'});
                    }
                    else if(key === 'Rank') {
                        doc.text(truncateText(crew[key as keyof DeductionRegisterCrew].toString(), 22), colPositions[i] + 5,  y + 5, {align: 'left'});
                    }
                    else {
                        const value = crew[key as keyof DeductionRegisterCrew];
                        doc.text(formatCurrency(Number(value) || 0), colPositions[i] + colWidths[i] * scaleFactor - 5, y + 5, { align: 'right' });
                    }
                });

                // Draw horizontal line at bottom of crew row
                doc.line(margins.left, y + rowHeight, pageWidth - margins.right, y + rowHeight);

                // Move to next row
                y += rowHeight;
                currentY = y

                // If crew has allottees, draw them in subsequent rows
                if (crew.Deductions && crew.Deductions.length > 0) {
                    crew.Deductions.forEach(deduction => {
                        // Check if we need a new page for this allottee
                        if (y + rowHeight > pageHeight - margins.bottom - 8) {
                            // Draw vertical lines on left and right sides of the table for this page
                            doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
                            doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

                            

                            // Start a new page with headers
                            addPageHeaders(vessel);

                            // Reset table position trackers for new page
                            y = currentY;
                            tableStartY = currentY;
                        }

                         // Format the deduction details - important to use fixed positions that match the image
                        const currencyLabel = deduction.Currency === 1 ? "Usd" : "PhP";
                        const amountWithRate = deduction.Currency === 1 ? `${formatCurrency(deduction.Amount)} X ${deduction.ExchangeRate}` : `${formatCurrency(deduction.Amount)}`;

                        // Calculate dollar amount based on currency
                        const dollarAmount = deduction.Currency === 1
                            ? deduction.Amount * deduction.ExchangeRate
                            : deduction.Amount;

                        // Define fixed positions for deduction details based on the sample image
                        const namePosition = margins.left + mainTableWidth * 0.5; // Deduction name position
                        const currencyPosition = margins.left + mainTableWidth * 0.7; // Currency label position
                        const amountPosition = margins.left + mainTableWidth * 0.8; // Amount/rate position
                        
                        doc.text(deduction.Name, namePosition + 20, y + rowHeight / 2 + 1);
                        doc.text(currencyLabel, currencyPosition + 12, y + rowHeight / 2 + 1);
                        doc.text(amountWithRate, amountPosition + 6, y + rowHeight / 2 + 1);
                        doc.text(formatCurrency(dollarAmount), pageWidth - margins.right - 5, y + rowHeight / 2 + 1, { align: 'right' });

                        // Move to next row
                        y += rowHeight;
                    });
                }
                doc.line(margins.left, y, pageWidth - margins.right, y);
            });

            // Draw vertical lines on left and right sides of the table for the last section
            doc.line(margins.left, tableStartY, margins.left, y); // Left vertical line
            doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, y); // Right vertical line

            

            // If there are more vessels, prepare for the next vessel (forcing new page)
            if (vesselIndex < vesselData.length - 1) {
                isFirstPage = false;
            }
        });

       // NOW ADD PAGE NUMBERS TO ALL PAGES - Get actual total pages
        const totalPages = doc.internal.pages.length - 1; // Subtract 1 because pages array includes a blank first element

        // Loop through all pages and add page numbers
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            // Draw page number box at bottom
            addPageFooter(i, totalPages)
        }
        // Save the final PDF
        const fileName = `allotment-payroll-register-multiple-vessels-${periodMonth.toLowerCase()}-${year}.pdf`;
        doc.save(fileName)
        // // Save the PDF using the updated content with correct page numbers
        // const blob = dataURItoBlob(updatedPdfText);
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = fileName;
        // link.click();

        // // Clean up
        // setTimeout(() => {
        //     URL.revokeObjectURL(url);
        // }, 100);

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
export function generateDeductionAllotmentV2PDF(
    vesselData: DeductionRegisterData[],
    month: number,
    year: number,
    exchangeRate: number = 57.53,
): void {
    generateDeductionAllotmentV2Register(vesselData, month, year, exchangeRate);
}
