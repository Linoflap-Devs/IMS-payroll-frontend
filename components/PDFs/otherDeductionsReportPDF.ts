"use client";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";
import { capitalizeFirstLetter, formatCurrency, getMonthName } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";
import { otherDeductionsCrew, otherDeductionsData } from "@/src/services/deduction/crewDeduction.api";

export interface OtherDeductionsResponse {
    success: boolean;
    message: string;
    data: otherDeductionsData;
}

// Get month and year from message (e.g., "3/2025")
function extractPeriod(message: string): { month: string, year: number } {
    const regex = /(\d+)\/(\d+)/;
    const match = message.match(regex);
    if (match && match.length >= 3) {
        const monthNum = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        return {
            month: getMonthName(monthNum),
            year: year
        };
    }
    return {
        month: "FEBRUARY", // Default for testing
        year: 2025 // Default for testing
    };
}

function calculateTotals(crew: otherDeductionsCrew[]): { cashAdvTotal: number, deductionTotal: number } {
    let cashAdvTotal = 0;
    let deductionTotal = 0;

    crew.forEach(crewMember => {
        let amount = 0;
        if (crewMember.Currency === 2) {
            amount = crewMember.OriginalAmount;
        } else {
            // Convert all to dollar
            amount = crewMember.DeductionAmount / crewMember.ExchangeRate;
        }

        if (crewMember.DeductionName.toLowerCase().includes("cash advance")) {
            cashAdvTotal += amount;
        } else {
            deductionTotal += amount;
        }
    });

    return { cashAdvTotal, deductionTotal };
}


export function generateOtherDeductionsReportPDF(
    data: OtherDeductionsResponse,
    dateGenerated: Date,
    mode: 'all' | 'vessel' = 'vessel'
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!data.success || !data.data || data.data.Crew.length === 0) {
        toast({
          title: "Error",
          description: 'Invalid or empty data for date.',
          variant: "destructive",
        });
        //console.error('Invalid or empty data for deduction register');
        return false;
    }

    try {
        // Extract vessel data
        const vesselData = data.data;
        // Extract period information from message
        const period = extractPeriod(data.message);

        // Create a new PDF document in landscape orientation with LEGAL size
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "legal"
        });

        // Add custom font with peso symbol support
        try {
            addFont(doc);
            doc.setFont('NotoSans', 'normal');
        } catch (error) {
            console.warn("Could not load custom font, using default", error);
            doc.setFont('helvetica', 'normal');
        }

        // Set document properties
        doc.setProperties({
            title: `Crew Deductions Report - ${period.month}/${period.year}`,
            subject: `Crew Deductions Report - ${period.month}/${period.year}`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = { left: 10, right: 10, top: 10, bottom: 10 };

        // Initialize current Y position
        let currentY = margins.top;

        // Calculate table dimensions
        const mainTableWidth = pageWidth - margins.left - margins.right;

        // Define columns for the main table
        const colWidths = [
            mainTableWidth * 0.25, // CrewName
            mainTableWidth * 0.20, // VesselName
            mainTableWidth * 0.05, // Cash Adv. Amount
            mainTableWidth * 0.15, // Cash Adv. Remarks
            mainTableWidth * 0.15, // Deduction Name
            mainTableWidth * 0.05, // Deduction Amount
            mainTableWidth * 0.25, // Deduction Remarks
        ];

        // Calculate column positions
        const colPositions: number[] = [];
        let runningPosition = margins.left;
        colWidths.forEach(width => {
            colPositions.push(runningPosition);
            runningPosition += width;
        });
        colPositions.push(runningPosition); // Add end position

        // Define heights
        const rowHeight = 8;
        const tableHeaderHeight = 8;

        const drawTotalsRow = () => {
            const totals = calculateTotals(data.data.Crew);
            
            // Check if we need a new page for the totals row
            if (currentY + rowHeight * 2 > pageHeight - margins.bottom - 20) {
                doc.addPage();
                currentY = margins.top;
                drawPageHeader();
                drawTableHeader();
            }

            // Add some spacing before totals
            currentY += 2;

            // Set font for totals row
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');

            // Draw borders for totals row
            doc.line(margins.left, currentY, margins.left, currentY + rowHeight); // Left border
            doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight); // Right border
            doc.line(margins.left, currentY, pageWidth - margins.right, currentY); // Top border

            // Draw "TOTALS" label in the first column
            doc.text("TOTALS", colPositions[0] + 5, currentY + rowHeight / 2 + 1, { align: 'left' });

            // Draw Cash Advance Total (column index 2)
            if (totals.cashAdvTotal > 0) {
                doc.setFont('NotoSans', 'bold');
                doc.text(`$${formatCurrency(totals.cashAdvTotal)}`, colPositions[2] + colWidths[2] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });
                doc.setFont('helvetica', 'bold');
            }

            // Draw Deduction Total (column index 5)
            if (totals.deductionTotal > 0) {
                doc.setFont('NotoSans', 'bold');
                //doc.text(`₱${formatCurrency(totals.deductionTotal)}`, colPositions[5] + colWidths[5] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });
                doc.text(`$${formatCurrency(totals.deductionTotal)}`, colPositions[5] + colWidths[5] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });
                doc.setFont('helvetica', 'bold');
            }

            // Draw bottom border for totals row
            doc.line(margins.left, currentY + rowHeight, pageWidth - margins.right, currentY + rowHeight);

            currentY += rowHeight;
        };

        // Function to draw the header (company info, vessel info, etc.)
        const drawPageHeader = (vesselName?: string) => {
            // Draw header table (3-column structure)
            const headerWidth = pageWidth - margins.left - margins.right;
            const companyColWidth = 90;
            const middleColWidth = headerWidth - companyColWidth - 100;
            const rightColWidth = 100;

            // Draw header table borders
            doc.setLineWidth(0.1);
            doc.setDrawColor(0);

            // Header container
            doc.rect(margins.left, currentY, pageWidth - margins.right - 10, 40);
            
            // Logo
            doc.addImage(logoBase64Image, 'PNG', margins.left, currentY, 20, 20);

            // Add company name text
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("IMS PHILIPPINES", margins.left + 25, currentY + 9);
            doc.text("MARITIME CORP.", margins.left + 25, currentY + 14);

            // Add month/year and report title
            doc.rect(margins.left + companyColWidth + middleColWidth, currentY, rightColWidth, 10);
            doc.rect(margins.left + companyColWidth + middleColWidth, currentY + 10, rightColWidth, 10);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `${period.month} ${period.year}`,
                margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                currentY + 6.5,
                { align: 'right' }
            );
            doc.text(
                "CREW DEDUCTIONS REPORT",
                margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                currentY + 16,
                { align: 'right' }
            );

            currentY += 20;

            // Draw vessel information table
            const vesselInfoY = currentY;
            doc.line(margins.left, vesselInfoY, pageWidth - margins.right, vesselInfoY);
            doc.setFontSize(8);
            
            // Text Gray
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text("VESSEL", margins.left + 2, vesselInfoY + 4.5);
            doc.setTextColor(0);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(vesselName || 'ALL VESSELS', margins.left + 2, vesselInfoY + 7.5);
            doc.line(margins.left, vesselInfoY + 10, pageWidth - margins.right, vesselInfoY + 10);

            doc.line(margins.left + companyColWidth + middleColWidth, 30, margins.left + companyColWidth + middleColWidth, 40);

            // Add exchange rate and date
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `EXCHANGE RATE: 1 USD = ${formatCurrency(data.data.ExchangeRate)} PHP`,
                margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                vesselInfoY + 6,
                { align: 'right' }
            );

            doc.setFont('helvetica', 'italic');
            doc.text(
                format(dateGenerated, 'yyyy-MM-dd HH:mm aa'),
                margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                vesselInfoY + 16,
                { align: 'right' }
            );

            currentY += 20;

            // Gray separator line
            const separatorY = currentY + 4;
            doc.setDrawColor(180);
            doc.setLineWidth(1);
            doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            currentY = separatorY + 4;
        };

        // Function to draw the table header
        const drawTableHeader = () => {
            // Draw table headers
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            
            // Draw horizontal borders for header row only
            doc.line(margins.left, currentY, pageWidth - margins.right, currentY); // Top border
            doc.line(margins.left, currentY + tableHeaderHeight, pageWidth - margins.right, currentY + tableHeaderHeight); // Bottom border

            // Draw left and right borders
            doc.line(margins.left, currentY, margins.left, currentY + tableHeaderHeight); // Left border
            doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + tableHeaderHeight); // Right border

            // Add header text
            const headers = ["Crew Name", "Vessel Name", "Cash Adv. Amount", "Cash Adv. Remarks", "Deduction Name", "Deduction Amount", "Deduction Remarks"];
            headers.forEach((header, index) => {
                const colX = colPositions[index];
                const colWidth = colWidths[index];
                if(header.includes("Amount")) {
                    doc.text(header, colX + colWidth - 5, currentY + tableHeaderHeight / 2 + 1, { align: 'right' })
                }
                else {
                    doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' })
                }
            });

            currentY += tableHeaderHeight;
        };

        currentY = margins.top;
        drawPageHeader(data.data.VesselName);
        drawTableHeader();

        // Process each vessel, starting each on a new page with full header
        data.data.Crew.forEach((crew, crewIndex) => {
            // For the first vessel, no addPage; for subsequent, add a new page
            // if (crewIndex > 0) {
            //     doc.addPage();
            // }

            
            // Calculate height needed for this crew entry
            const crewHeight = rowHeight;
            const totalEntryHeight = crewHeight;

            // Check if we need a new page
            if (currentY + totalEntryHeight > pageHeight - margins.bottom - 20) { // Leave space for page number
                doc.addPage();
                currentY = margins.top;
                drawPageHeader();
                drawTableHeader();
            }

            // Set font for crew data
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');

            // Draw left and right borders only
            doc.line(margins.left, currentY, margins.left, currentY + rowHeight); // Left border
            doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight); // Right border

            // Draw crew data
            const columnKeys: string[] = [
                "CrewName",
                "VesselName",
                "DeductionAmount",
                "DeductionName",
                "DeductionRemarks",
            ];

            columnKeys.forEach((key, i) => {
                if(i === 0) {
                    // Crew Name
                    const crewName = `${crew.LastName}, ${crew.FirstName} ${crew.MiddleName ? crew.MiddleName[0] + '.' : ''}`;
                    doc.text(crewName, colPositions[i] + 5, currentY + rowHeight / 2 + 1, {align: 'left'});
                }
                else if (i === 2) {
                    // Amount
                    
                    let value = 0
                    if(crew.Currency === 2){
                        // multiply by exchange rate
                        //console.log(`Multiyplying ${crew.OriginalAmount} by ${crew.ExchangeRate}`)
                        value = crew.OriginalAmount
                    }
                    else {
                        // Convert to Dollar
                        value = (crew.DeductionAmount / crew.ExchangeRate)
                    }

                    let positionIdx = 0
                    if(crew.DeductionName.toLowerCase().includes("cash advance")){
                        positionIdx = 2
                    }
                    else {
                        positionIdx = 5
                    }

                    doc.setFont('NotoSans', 'normal');
                    //doc.text(`${crew.Currency == 2 ? '$' : '\u20B1' }${formatCurrency(value)}`, colPositions[positionIdx] + colWidths[i] - 5, currentY + rowHeight / 2 + 1, {align: 'right'});
                    // convert all to dollar
                    doc.text(`$${formatCurrency(value)}`, colPositions[positionIdx] + colWidths[i] - 5, currentY + rowHeight / 2 + 1, {align: 'right'});
                    doc.setFont('helvetica', 'normal');
                }
                else if(i == 3){

                    // Name
                    let positionIdx = 0
                    if(!crew.DeductionName.toLowerCase().includes("cash advance")){
                        positionIdx = 4
                        doc.text(crew[key as keyof otherDeductionsCrew]?.toString() || '', colPositions[positionIdx] + 5, currentY + rowHeight / 2 + 1, {align: 'left'});
                    }
                }
                else if(i == 4){
                    let positionIdx = 0
                    if(crew.DeductionName.toLowerCase().includes("cash advance")){
                        positionIdx = 3
                    }
                    else {
                        positionIdx = 6
                    }
                    doc.text(crew[key as keyof otherDeductionsCrew]?.toString() || '', colPositions[positionIdx] + 5, currentY + rowHeight / 2 + 1, {align: 'left'});
                }
                else {
                    doc.text(crew[key as keyof otherDeductionsCrew]?.toString() || '', colPositions[i] + 5, currentY + rowHeight / 2 + 1, {align: 'left'});
                }
            });

            // Draw horizontal line at the bottom of crew row
            doc.line(margins.left, currentY + rowHeight, pageWidth - margins.right, currentY + rowHeight);

            // Move to next row
            currentY += rowHeight;
        });

        // Add the totals row after all crew members
        drawTotalsRow();

        // NOW ADD PAGE NUMBERS TO ALL PAGES
        const totalPages = doc.internal.pages.length - 1;
        // Loop through all pages and add page numbers
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Draw page number box at bottom
            doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text(
                `Page ${i} out of ${totalPages}`, 
                pageWidth - margins.right - 5, 
                pageHeight - margins.bottom - 4, 
                { align: 'right' }
            );
        }

        // Save the PDF
        const fileName = mode === 'vessel' ?
        `CrewDeductions_${capitalizeFirstLetter(data.data.VesselName?.replace(' ', '-') || "")}_${capitalizeFirstLetter(period.month)}-${period.year}.pdf` : 
        `CrewDeductions_ALL_${capitalizeFirstLetter(period.month)}-${period.year}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating Crew Deductions List:", error);
        return false;
    }
}

// Function to generate the PDF with real data
export function generateOtherDeductionsReport(data: OtherDeductionsResponse, dateGenerated: Date, mode: 'all' | 'vessel' = 'vessel'): boolean {
    return generateOtherDeductionsReportPDF(
        data,
        dateGenerated,
        mode
    );
}

// Default export for easy importing
export default generateOtherDeductionsReport;