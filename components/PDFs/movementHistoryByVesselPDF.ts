"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";
import { capitalizeFirstLetter, truncateText } from "@/lib/utils";
import { Deductions } from "@/src/services/payroll/payroll.api";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";

// Updated interfaces to match vessel-grouped data structure
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

// New interface for vessel-grouped data
export interface VesselMovementHistory {
    VesselName: string;
    CrewList: CrewMovementHistory[];
}

export interface MovementHistoryPDFResponse {
    success: boolean;
    message: string;
    data: VesselMovementHistory[];
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
 * Generate movement history PDF from vessel-grouped data
 * @param vesselData Array of vessel data with crew lists
 * @param month Month number (1-12)
 * @param year Year (e.g., 2025)
 * @param dateGenerated Date when report was generated
 * @param mode 'all' to show all vessels, 'vessel' for single vessel
 * @returns boolean indicating if PDF generation was successful
 */
export function generateMovementHistoryByVessel(
    vesselData: VesselMovementHistory[],
    month: number, 
    year: number,
    dateGenerated: Date,
    mode: 'all' | 'vessel' = 'all'
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!vesselData || vesselData.length === 0) {
        toast({
          title: "Error",
          description: 'Invalid or empty data for date.',
          variant: "destructive",
        });
        return false;
    }

    try {
        // Create a new PDF document in landscape orientation with LETTER size
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "letter"
        });

        // Add custom font with peso symbol support
        try {
            addFont(doc);
            doc.setFont('NotoSans', 'normal');
        } catch (error) {
            console.warn("Could not load custom font, using default", error);
            doc.setFont('helvetica', 'normal');
        }

        doc.setProperties({
            title: `Vessel Movement - ${getMonthName(month)} ${year}`,
            subject: `Vessel Movement - ${getMonthName(month)} ${year}`,
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
            mainTableWidth * 0.35, // CREW NAME
            mainTableWidth * 0.20, // VESSEL
            mainTableWidth * 0.10, // Sign On
            mainTableWidth * 0.10, // Sign Off
            mainTableWidth * 0.25, // Remarks
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

        // Calculate total movements across all vessels
        const totalMovements = vesselData.reduce((total, vessel) => {
            return total + vessel.CrewList.reduce((crewTotal, crew) => {
                return crewTotal + crew.Movements.length;
            }, 0);
        }, 0);

        // Function to draw the header (company info, vessel info, etc.)
        const drawPageHeader = (currentVesselName: string, totalMovements: number) => {
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
                `${getMonthName(month)} ${year}`,
                margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                currentY + 6.5,
                { align: 'right' }
            );
            doc.text(
                "VESSEL MOVEMENT RECORD",
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
            doc.text(mode === 'vessel' ? currentVesselName : 'ALL VESSELS', margins.left + 2, vesselInfoY + 7.5);
            doc.line(margins.left, vesselInfoY + 10, pageWidth - margins.right, vesselInfoY + 10);

            doc.line(margins.left + companyColWidth + middleColWidth, 30, margins.left + companyColWidth + middleColWidth, 40);

            // Add movement count and date
            if(totalMovements > 0){
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `${totalMovements} MOVEMENTS`,
                    margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
                    vesselInfoY + 6,
                    { align: 'right' }
                );
            }

            doc.setFont('helvetica', 'italic');
            doc.text(
                format(dateGenerated, 'yyyy-MM-dd hh:mm aa'),
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
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            // Draw horizontal borders for header row only
            doc.line(margins.left, currentY, pageWidth - margins.right, currentY); // Top border
            doc.line(margins.left, currentY + tableHeaderHeight, pageWidth - margins.right, currentY + tableHeaderHeight); // Bottom border

            // Draw left and right borders
            doc.line(margins.left, currentY, margins.left, currentY + tableHeaderHeight); // Left border
            doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + tableHeaderHeight); // Right border

            // Add header text
            const headers = ["CREW NAME", "VESSEL", "SIGN-ON", "SIGN-OFF", "REMARKS"];
            headers.forEach((header, index) => {
                const colX = colPositions[index];
                doc.text(header, colX + 5, currentY + tableHeaderHeight / 2 + 1, { align: 'left' })
            });

            currentY += tableHeaderHeight;
        };

        // Draw initial page header and table header
        const firstVesselName = mode === 'all' ? 'ALL VESSELS' : vesselData[0]?.VesselName || 'UNKNOWN VESSEL';
        drawPageHeader(firstVesselName, totalMovements);
        drawTableHeader();

        // Process each vessel and flatten the data back to original format
        vesselData.forEach((vessel) => {
            vessel.CrewList.forEach((crew) => {
                crew.Movements.forEach((movement) => {
                    // Calculate height needed for this row
                    const totalEntryHeight = rowHeight;
        
                    // Check if we need a new page
                    if (currentY + totalEntryHeight > pageHeight - margins.bottom - 20) {
                        doc.addPage();
                        currentY = margins.top;
                        drawPageHeader(firstVesselName, totalMovements);
                        drawTableHeader();
                    }
        
                    // Set font for crew data
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
        
                    // Draw horizontal line at the top of row
                    doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
        
                    // Draw left and right borders
                    doc.line(margins.left, currentY, margins.left, currentY + rowHeight);
                    doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight);
        
                    // Draw row data - back to original format with vessel column
                    const rowData = [
                        `${crew.LastName.toUpperCase()}, ${crew.FirstName.toUpperCase()} ${crew.MiddleName ? crew.MiddleName + ' ' : ''}`,
                        vessel.VesselName, // Show vessel name in the vessel column
                        movement.OnboardDate ? format(movement.OnboardDate, 'yyyy-MM-dd') : '',
                        movement.OffboardDate ? format(movement.OffboardDate, 'yyyy-MM-dd') : '',
                        movement.Remarks || ''
                    ];
        
                    rowData.forEach((value, i) => {
                        doc.text(value, colPositions[i] + 5, currentY + rowHeight / 2 + 1, {align: 'left'});
                    });
        
                    // Draw horizontal line at the bottom of row
                    doc.line(margins.left, currentY + rowHeight, pageWidth - margins.right, currentY + rowHeight);
        
                    // Move to next row
                    currentY += rowHeight;
                });
            });
        });

        // Add page numbers to all pages
        const totalPages = doc.getNumberOfPages();
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
        const fileName = mode === 'vessel' && vesselData.length === 1 ?
            `VesselMovement_${capitalizeFirstLetter(vesselData[0].VesselName || 'UnknownVessel')}_${capitalizeFirstLetter(getMonthName(month))}-${year}.pdf` : 
            `VesselMovement_ALL_${capitalizeFirstLetter(getMonthName(month))}-${year}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating Vessel Movement List:", error);
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

// Updated example usage function
export function generateMovementHistoryByVesselPDF(
    vesselData: VesselMovementHistory[],
    month: number,
    year: number,
    dateGenerated: Date,
    mode: 'vessel' | 'all'
): void {
    generateMovementHistoryByVessel(vesselData, month, year, dateGenerated, mode);
}