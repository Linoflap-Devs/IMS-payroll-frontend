"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";

// Define interfaces for the data structure
interface Allottee {
    name: string;
    accountNumber: string;
    bank: string;
    allotmentAmount: number;
}

interface CrewMember {
    name: string;
    rank: string;
    basicWage: number;
    fixedOT: number;
    guarOT: number;
    dollarGross: number;
    pesoGross: number;
    totalDeduction: number;
    netPay: number;
    allottees: Allottee[];
}

interface PayrollRegisterData {
    month: string;
    year: number;
    vesselName: string;
    exchangeRate: number;
    dateGenerated: string;
    crewMembers: CrewMember[];
    totalPages: number;
    currentPage: number;
}

// Format currency values with commas and 2 decimal places
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Get current UTC date and time in specified format
function getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function generateAllotmentPayrollRegister(data: PayrollRegisterData, currentUser: string = 'admin'): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    try {
        // Create a new PDF document in landscape orientation with LEGAL size
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "legal" // Legal size (8.5" × 14") - longer than A4
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
            title: `Allotment Payroll Register - ${data.vesselName} - ${data.month} ${data.year}`,
            subject: `Allotment Payroll Register for ${data.vesselName}`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = { left: 10, right: 10, top: 10, bottom: 10 };

        // Draw header table (3-column structure)
        const headerWidth = pageWidth - margins.left - margins.right;
        const companyColWidth = 90;  // Width for company info
        const middleColWidth = headerWidth - companyColWidth - 100;  // Middle empty space
        const rightColWidth = 100;  // Width for month/year and report title

        // Draw header table borders
        doc.setLineWidth(0.1);
        doc.setDrawColor(0);

        // Left column (Company info)
        doc.rect(margins.left, margins.top, companyColWidth, 30);

        // Middle column (Empty space)
        doc.rect(margins.left + companyColWidth, margins.top, middleColWidth, 30);

        // Right column (Month/Year and Report Title)
        doc.rect(margins.left + companyColWidth + middleColWidth, margins.top, rightColWidth, 15); // Month/Year cell
        doc.rect(margins.left + companyColWidth + middleColWidth, margins.top + 15, rightColWidth, 15); // Report Title cell

        // Add IMS Philippines logo (placeholder)
        doc.setFillColor(31, 184, 107); // Green color
        doc.setDrawColor(0);
        doc.roundedRect(margins.left + 10, margins.top + 5, 20, 20, 2, 2, 'FD');
        doc.setTextColor(255); // White text
        doc.setFontSize(8);
        doc.text("IMS PHIL", margins.left + 20, margins.top + 15, { align: 'center' });
        doc.setTextColor(0); // Reset to black

        // Add company name text
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("IMS PHILIPPINES", margins.left + 35, margins.top + 12);
        doc.text("MARITIME CORP.", margins.left + 35, margins.top + 20);

        // Add month/year and report title
        doc.setFontSize(10);
        doc.text(`${data.month} ${data.year}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, margins.top + 10, { align: 'right' });
        doc.text("ALLOTMENT PAYROLL REGISTER", margins.left + companyColWidth + middleColWidth + rightColWidth - 5, margins.top + 25, { align: 'right' });

        // Draw vessel information table (3-column structure matching header)
        const vesselInfoY = margins.top + 30;

        // Left column (Vessel name)
        doc.rect(margins.left, vesselInfoY, companyColWidth, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text("VESSEL", margins.left + 5, vesselInfoY + 7);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(data.vesselName, margins.left + 5, vesselInfoY + 15);

        // Middle column (Empty space)
        doc.rect(margins.left + companyColWidth, vesselInfoY, middleColWidth, 20);

        // Right column (Exchange rate and date)
        doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY, rightColWidth, 10); // Exchange rate cell
        doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY + 10, rightColWidth, 10); // Date cell

        // Add exchange rate and date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`EXCHANGE RATE: USD > PHP ${data.exchangeRate}`, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 7, { align: 'right' });
        doc.text(data.dateGenerated, margins.left + companyColWidth + middleColWidth + rightColWidth - 5, vesselInfoY + 17, { align: 'right' });

        // Add back the horizontal gray separator line
        const separatorY = vesselInfoY + 28;
        doc.setDrawColor(180); // Gray color
        doc.setLineWidth(1);
        doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
        doc.setDrawColor(0); // Reset to black
        doc.setLineWidth(0.1);

        // Define main table starting position
        const mainTableY = separatorY + 8;

        // Define table column widths for the main data table
        const colWidths = [
            48,  // CREW NAME
            25,  // RANK
            28,  // BASIC WAGE
            28,  // FIXED OT
            28,  // GUAR OT
            35,  // DOLLAR GROSS
            35,  // PESO GROSS
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

        // Calculate column positions (without drawing vertical lines)
        const colPositions: number[] = [];
        let runningPosition = margins.left;
        colWidths.forEach(width => {
            colPositions.push(runningPosition);
            runningPosition += width * scaleFactor;
        });
        colPositions.push(runningPosition); // Add end position

        // Draw table headers (horizontal line only at bottom of header row)
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');

        // Draw top border of header row
        doc.line(margins.left, mainTableY, pageWidth - margins.right, mainTableY);

        // Draw header text
        const headers = [
            "CREW NAME", "RANK", "BASIC WAGE", "FIXED OT", "GUAR OT", "DOLLAR GROSS",
            "PESO GROSS", "TOTAL DED.", "NET", "ALLOTTEE NAME", "ACCOUNT NUMBER", "BANK", "ALLOTMENT"
        ];

        headers.forEach((header, index) => {
            const colWidth = colWidths[index] * scaleFactor;
            const colX = colPositions[index];
            doc.text(header, colX + colWidth / 2, mainTableY + 6, { align: 'center' });
        });

        // Draw horizontal line after headers
        doc.line(margins.left, mainTableY + 10, pageWidth - margins.right, mainTableY + 10);

        // Track the starting position for left vertical line
        const tableStartY = mainTableY;
        let tableEndY = mainTableY;

        // Draw table data rows
        let y = mainTableY + 10;
        const rowHeight = 8;

        data.crewMembers.forEach(crew => {
            // Set font for data
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            // Draw crew data
            doc.text(crew.name, colPositions[0] + 2, y + 5, { align: 'left' });
            doc.text(crew.rank, colPositions[1] + 2, y + 5, { align: 'left' });
            doc.text(formatCurrency(crew.basicWage), colPositions[2] + colWidths[2] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.fixedOT), colPositions[3] + colWidths[3] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.guarOT), colPositions[4] + colWidths[4] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.dollarGross), colPositions[5] + colWidths[5] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.pesoGross), colPositions[6] + colWidths[6] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.totalDeduction), colPositions[7] + colWidths[7] * scaleFactor - 2, y + 5, { align: 'right' });
            doc.text(formatCurrency(crew.netPay), colPositions[8] + colWidths[8] * scaleFactor - 2, y + 5, { align: 'right' });

            // Draw horizontal line at bottom of crew row
            doc.line(margins.left, y + rowHeight, pageWidth - margins.right, y + rowHeight);
            tableEndY = y + rowHeight;

            // If crew has allottees, draw them in subsequent rows
            if (crew.allottees && crew.allottees.length > 0) {
                crew.allottees.forEach((allottee, idx) => {
                    // Move to next row for allottee
                    y += rowHeight;

                    // Add allottee details (no vertical lines)
                    doc.text(allottee.name, colPositions[9] + 2, y + 5, { align: 'left' });
                    doc.text(allottee.accountNumber, colPositions[10] + 2, y + 5, { align: 'left' });
                    doc.text(allottee.bank, colPositions[11] + 2, y + 5, { align: 'left' });
                    doc.text(formatCurrency(allottee.allotmentAmount), colPositions[12] + colWidths[12] * scaleFactor - 2, y + 5, { align: 'right' });

                    // Draw horizontal line at bottom of row
                    doc.line(margins.left, y + rowHeight, pageWidth - margins.right, y + rowHeight);
                    tableEndY = y + rowHeight;
                });
            }

            // Move to next crew row (after all allottees)
            y += rowHeight;
        });

        // Draw vertical lines on left and right sides of the table
        doc.line(margins.left, tableStartY, margins.left, tableEndY); // Left vertical line
        doc.line(pageWidth - margins.right, tableStartY, pageWidth - margins.right, tableEndY); // Right vertical line

        // Draw page number box at bottom
        doc.rect(margins.left, pageHeight - margins.bottom - 10, pageWidth - margins.left - margins.right, 10);
        doc.setFontSize(9);
        doc.text(`Page ${data.currentPage} out of ${data.totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });

        // Add footer with current date/time and user
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + getCurrentDateTime(), margins.left, pageHeight - margins.bottom - 20);
        doc.text("Current User's Login: " + currentUser, margins.left, pageHeight - margins.bottom - 15);

        // Save the PDF
        const fileName = `allotment-payroll-register-${data.vesselName.toLowerCase()}-${data.month.toLowerCase()}-${data.year}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating PDF:", error);
        return false;
    }
}