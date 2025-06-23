"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";

// Define interfaces based on your JSON data structure
interface Deduction {
    Name: string;
    Amount: number;
    ExchangeRate: number;
    Currency: number; // 0 = PHP, 1 = USD
}

interface CrewMember {
    CrewID: number;
    CrewName: string;
    Rank: string;
    Salary: number;
    Allotment: number;
    Gross: number;
    Deduction: number;
    Deductions: Deduction[];
}

interface VesselData {
    VesselID: number;
    VesselName: string;
    Crew: CrewMember[];
}

interface DeductionRegisterData {
    success: boolean;
    message: string;
    data: VesselData[];
}

// Format currency values with commas and 2 decimal places
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Get formatted date string for the header
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

// Function to convert month number to name
function getMonthName(monthNum: number): string {
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return months[monthNum - 1];
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

export function generateDeductionRegisterPDF(
    data: DeductionRegisterData,
    exchangeRate: number = 57.53,
    dateGenerated: string = "04/14/25 9:55 AM",
    currentUser: string = 'lanceballicud'
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!data.success || !data.data || data.data.length === 0 || !data.data[0].Crew || data.data[0].Crew.length === 0) {
        console.error('Invalid or empty data for deduction register');
        return false;
    }

    try {
        // Extract vessel data
        const vesselData = data.data[0];

        // Extract period information from message
        const period = extractPeriod(data.message);

        // Create a new PDF document in landscape orientation with LEGAL size
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "legal" // Legal size (8.5" × 14")
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
            title: `Allotment Deduction Register - ${vesselData.VesselName} - ${period.month} ${period.year}`,
            subject: `Deduction Register for ${vesselData.VesselName}`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = { left: 10, right: 10, top: 10, bottom: 10 };

        // Define maximum content height per page (leave room for page number at bottom)
        const maxContentHeight = pageHeight - margins.top - margins.bottom - 10;

        // Initialize paging variables
        let currentPage = 1;
        const totalPages = 20; // Placeholder for total pages

        // Initialize current Y position
        let currentY = margins.top;

        // Calculate table dimensions
        const mainTableWidth = pageWidth - margins.left - margins.right;

        // Define columns for the main table
        const colWidths = [
            mainTableWidth * 0.16, // CREW NAME
            mainTableWidth * 0.08, // RANK
            mainTableWidth * 0.08, // SALARY
            mainTableWidth * 0.08, // BASIC WAGE
            mainTableWidth * 0.10, // GROSS
            mainTableWidth * 0.50  // Deduction details
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

        // -------------------------------------------------
        // FIRST PAGE - Draw header only once
        // -------------------------------------------------

        // Draw header table (3-column structure)
        const headerWidth = pageWidth - margins.left - margins.right;
        const companyColWidth = 90;
        const middleColWidth = headerWidth - companyColWidth - 100;
        const rightColWidth = 100;

        // Draw header table borders
        doc.setLineWidth(0.1);
        doc.setDrawColor(0);

        // Left column (Company info)
        doc.rect(margins.left, currentY, companyColWidth, 30);

        // Middle column (Empty space)
        doc.rect(margins.left + companyColWidth, currentY, middleColWidth, 30);

        // Right column (Month/Year and Report Title)
        doc.rect(margins.left + companyColWidth + middleColWidth, currentY, rightColWidth, 15);
        doc.rect(margins.left + companyColWidth + middleColWidth, currentY + 15, rightColWidth, 15);

        // Add IMS Philippines logo (placeholder)
        doc.setFillColor(31, 184, 107);
        doc.setDrawColor(0);
        doc.roundedRect(margins.left + 10, currentY + 5, 20, 20, 2, 2, 'FD');
        doc.setTextColor(255);
        doc.setFontSize(8);
        doc.text("IMS PHIL", margins.left + 20, currentY + 15, { align: 'center' });
        doc.setTextColor(0);

        // Add company name text
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("IMS PHILIPPINES", margins.left + 35, currentY + 12);
        doc.text("MARITIME CORP.", margins.left + 35, currentY + 20);

        // Add month/year and report title
        doc.setFontSize(10);
        doc.text(
            `${period.month} ${period.year}`,
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            currentY + 10,
            { align: 'right' }
        );
        doc.text(
            "ALLOTMENT DEDUCTION REGISTER",
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            currentY + 25,
            { align: 'right' }
        );

        currentY += 30;

        // Draw vessel information table
        const vesselInfoY = currentY;

        // Left column (Vessel name)
        doc.rect(margins.left, vesselInfoY, companyColWidth, 20);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text("VESSEL", margins.left + 5, vesselInfoY + 7);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(vesselData.VesselName, margins.left + 5, vesselInfoY + 15);

        // Middle column (Empty space)
        doc.rect(margins.left + companyColWidth, vesselInfoY, middleColWidth, 20);

        // Right column (Exchange rate and date)
        doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY, rightColWidth, 10);
        doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY + 10, rightColWidth, 10);

        // Add exchange rate and date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `EXCHANGE RATE: USD > PHP ${exchangeRate}`,
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            vesselInfoY + 7,
            { align: 'right' }
        );
        doc.text(
            dateGenerated,
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            vesselInfoY + 17,
            { align: 'right' }
        );

        currentY += 20;

        // Gray separator line
        const separatorY = currentY + 8;
        doc.setDrawColor(180);
        doc.setLineWidth(1);
        doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);

        currentY = separatorY + 8;

        // -------------------------------------------------
        // TABLE HEADER - Draw on first page and any new pages
        // -------------------------------------------------

        // Function to draw the table header
        const drawTableHeader = () => {
            // Draw table headers
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');

            // Draw header row border
            doc.rect(margins.left, currentY, mainTableWidth, tableHeaderHeight);

            // Add header text
            const headers = ["CREW NAME", "RANK", "SALARY", "BASIC WAGE", "GROSS"];
            headers.forEach((header, index) => {
                const colX = colPositions[index];
                const colWidth = colWidths[index];
                doc.text(header, colX + colWidth / 2, currentY + tableHeaderHeight / 2 + 1, { align: 'center' });
            });

            // Draw vertical lines for header columns
            for (let i = 0; i <= colPositions.length - 1; i++) {
                doc.line(colPositions[i], currentY, colPositions[i], currentY + tableHeaderHeight);
            }

            currentY += tableHeaderHeight;
        };

        // Draw table header on first page
        drawTableHeader();

        // -------------------------------------------------
        // TABLE DATA - Process each crew member
        // -------------------------------------------------

        // Function to add a new page with only the table header
        const addNewPage = () => {
            doc.addPage();
            currentPage++;
            currentY = margins.top;

            // Draw table header on the new page
            drawTableHeader();
        };

        // Process each crew member
        vesselData.Crew.forEach((crew, crewIndex) => {
            // Calculate height needed for this crew entry (crew row + deduction rows)
            const crewHeight = rowHeight;
            const deductionsHeight = crew.Deductions ? crew.Deductions.length * rowHeight : 0;
            const totalEntryHeight = crewHeight + deductionsHeight;

            // Check if we need a new page
            if (currentY + totalEntryHeight > pageHeight - margins.bottom - 10) {
                // Draw page number box at bottom of current page
                doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
                doc.setFontSize(9);
                doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });

                // Add footer with current date/time and user


                // Start a new page
                addNewPage();
            }

            // Set font for crew data
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            // Draw crew row border
            doc.rect(margins.left, currentY, mainTableWidth, rowHeight);

            // Draw crew data
            doc.text(crew.CrewName, colPositions[0] + 5, currentY + rowHeight / 2 + 1);
            doc.text(crew.Rank, colPositions[1] + colWidths[1] / 2, currentY + rowHeight / 2 + 1, { align: 'center' });
            doc.text(formatCurrency(crew.Salary), colPositions[2] + colWidths[2] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });
            doc.text(formatCurrency(crew.Salary), colPositions[3] + colWidths[3] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });
            doc.text(formatCurrency(crew.Gross), colPositions[4] + colWidths[4] - 5, currentY + rowHeight / 2 + 1, { align: 'right' });

            // Draw vertical lines for crew row
            for (let i = 0; i <= colPositions.length - 1; i++) {
                doc.line(colPositions[i], currentY, colPositions[i], currentY + rowHeight);
            }

            // Move to next row
            currentY += rowHeight;

            // Process deductions for this crew
            if (crew.Deductions && crew.Deductions.length > 0) {
                crew.Deductions.forEach((deduction, idx) => {
                    // Check if we need a new page
                    if (currentY + rowHeight > pageHeight - margins.bottom - 10) {
                        // Draw page number box at bottom of current page
                        doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
                        doc.setFontSize(9);
                        doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });

                        // Add footer with current date/time and user
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'italic');
                        doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + getCurrentDateTime(), margins.left, pageHeight - margins.bottom - 20);
                        doc.text("Current User's Login: " + currentUser, margins.left, pageHeight - margins.bottom - 15);

                        // Start a new page
                        addNewPage();
                    }

                    // Draw deduction row border (full width)
                    doc.rect(margins.left, currentY, mainTableWidth, rowHeight);

                    // Left and right borders
                    doc.line(margins.left, currentY, margins.left, currentY + rowHeight);
                    doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight);

                    // Separator between crew data area and deduction details
                    // doc.line(colPositions[5], currentY, colPositions[5], currentY + rowHeight);

                    // Calculate positions for deduction details
                    const deductionAreaStart = colPositions[5];
                    const deductionAreaWidth = mainTableWidth - colPositions[5] + margins.left;

                    // Format the deduction details
                    const currencyLabel = deduction.Currency === 1 ? "Usd" : "PhP";
                    const amountWithRate = `${formatCurrency(deduction.Amount)}/${formatCurrency(deduction.ExchangeRate)}`;

                    // Calculate dollar amount based on currency
                    const dollarAmount = deduction.Currency === 1
                        ? deduction.Amount
                        : deduction.Amount / deduction.ExchangeRate;

                    // Draw deduction details
                    doc.text(deduction.Name, deductionAreaStart + deductionAreaWidth * 0.15, currentY + rowHeight / 2 + 1, { align: 'left' });
                    doc.text(currencyLabel, deductionAreaStart + deductionAreaWidth * 0.35, currentY + rowHeight / 2 + 1, { align: 'left' });
                    doc.text(amountWithRate, deductionAreaStart + deductionAreaWidth * 0.60, currentY + rowHeight / 2 + 1, { align: 'left' });
                    doc.text(formatCurrency(dollarAmount), deductionAreaStart + deductionAreaWidth - 5, currentY + rowHeight / 2 + 1, { align: 'right' });

                    // Move to next row
                    currentY += rowHeight;
                });
            }
        });

        // doc.setFontSize(8);
        // doc.setFont('helvetica', 'italic');
        // doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + getCurrentDateTime(), margins.left, pageHeight - margins.bottom - 20);
        // doc.text("Current User's Login: " + currentUser, margins.left, pageHeight - margins.bottom - 15);

        // Draw page number box at bottom of last page
        doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
        doc.setFontSize(9);
        doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });

        // Add footer with current date/time and user on last page
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + getCurrentDateTime(), margins.left, pageHeight - margins.bottom - 20);
        doc.text("Current User's Login: " + currentUser, margins.left, pageHeight - margins.bottom - 15);

        // Save the PDF
        const fileName = `deduction-register-${vesselData.VesselName.toLowerCase()}-${period.month.toLowerCase()}-${period.year}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error("Error generating deduction register PDF:", error);
        return false;
    }
}

// Real data from the user's JSON
const realData: DeductionRegisterData = {
    success: true,
    message: "List of deduction register for Vessel ID 9 for 1/2025",
    data: [
        {
            VesselID: 9,
            VesselName: "CHEMROAD ECHO",
            Crew: [
                {
                    CrewID: 194,
                    CrewName: "RODILLO LAGANAS NIALLA",
                    Rank: "BSN",
                    Salary: 620,
                    Allotment: 40825.7,
                    Gross: 62927.49,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 200,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 901.79,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 1437,
                    CrewName: "JEROLD ONG ESPLANADA",
                    Rank: "3RD OFFICER",
                    Salary: 860,
                    Allotment: 64819.13,
                    Gross: 87270,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 200,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 1250.87,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 1674,
                    CrewName: "CRIS JOHN PACINIO GARCIA",
                    Rank: "C/CK",
                    Salary: 620,
                    Allotment: 40625.7,
                    Gross: 62927.49,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 400,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 901.79,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 2288,
                    CrewName: "GERALD GARCIA DESCUTIDO",
                    Rank: "MMAN",
                    Salary: 415.2,
                    Allotment: 20318.41,
                    Gross: 42122.32,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 200,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 603.91,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 403,
                    CrewName: "ALBERT TEODOSIO ARCILLA",
                    Rank: "OLR1",
                    Salary: 620,
                    Allotment: 40825.7,
                    Gross: 62927.49,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 200,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 901.79,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 892,
                    CrewName: "JEFFREY MATURAN MIRANDE",
                    Rank: "2ND ENGINEER",
                    Salary: 968,
                    Allotment: 75218.08,
                    Gross: 98207.84,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 581.8,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 1407.96,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                },
                {
                    CrewID: 1663,
                    CrewName: "JEREMIAS TAMPEPE SALGADO",
                    Rank: "A/B",
                    Salary: 557.6,
                    Allotment: 34286.47,
                    Gross: 56597.5,
                    Deduction: 0,
                    Deductions: [
                        {
                            Name: "SSS Premium",
                            Amount: 20000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "SSS Provident",
                            Amount: 1000,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Pag-Ibig Contribution",
                            Amount: 500,
                            ExchangeRate: 58.18,
                            Currency: 0
                        },
                        {
                            Name: "Philhealth Contribution",
                            Amount: 811.03,
                            ExchangeRate: 58.18,
                            Currency: 0
                        }
                    ]
                }
            ]
        }
    ]
};

// Function to generate the PDF with real data
export function generateDeductionRegister() {
    return generateDeductionRegisterPDF(
        realData,
        57.53, // Exchange rate
        "04/14/25 9:55 AM", // Date generated
        "lanceballicud" // Current user
    );
}

// Default export for easy importing
export default generateDeductionRegister;