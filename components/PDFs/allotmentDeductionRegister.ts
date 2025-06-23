"use client";

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";

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
// function getCurrentDateTime(): string {
//     const now = new Date();
//     const year = now.getUTCFullYear();
//     const month = String(now.getUTCMonth() + 1).padStart(2, '0');
//     const day = String(now.getUTCDate()).padStart(2, '0');
//     const hours = String(now.getUTCHours()).padStart(2, '0');
//     const minutes = String(now.getUTCMinutes()).padStart(2, '0');
//     const seconds = String(now.getUTCSeconds()).padStart(2, '0');

//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }

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
    // currentUser: string = 'lanceballicud'
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
            format: "letter" // Legal size (8.5" × 14")
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
        // const maxContentHeight = pageHeight - margins.top - margins.bottom - 10;

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
            mainTableWidth * 0.09, // RANK
            mainTableWidth * 0.09, // SALARY
            mainTableWidth * 0.09, // BASIC WAGE
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

        // CrewHeader
        doc.rect(margins.left, currentY, pageWidth - margins.right - 10, 40)

        //logo
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
            "ALLOTMENT DEDUCTION REGISTER",
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            currentY + 16,
            { align: 'right' }
        );

        currentY += 20;

        // Draw vessel information table
        const vesselInfoY = currentY;

        // Left column (Vessel name)
        // doc.rect(margins.left, vesselInfoY, pageWidth - 20, 10);
        doc.line(margins.left, vesselInfoY, pageWidth - margins.right, vesselInfoY);
        doc.setFontSize(8);
        //text Gray
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text("VESSEL", margins.left + 2, vesselInfoY + 4.5);
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(vesselData.VesselName, margins.left + 2, vesselInfoY + 7.5);
        doc.line(margins.left, vesselInfoY + 10, pageWidth - margins.right, vesselInfoY + 10);


        // Middle column (Empty space)
        // doc.rect(margins.left + companyColWidth, vesselInfoY, middleColWidth, 20);

        // Right column (Exchange rate and date)
        // doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY, rightColWidth, 10);
        // doc.rect(margins.left + companyColWidth + middleColWidth, vesselInfoY + 10, rightColWidth, 10);
        doc.line(margins.left + companyColWidth + middleColWidth, 30, margins.left + companyColWidth + middleColWidth, 40);
        // doc.line(margins.left, margins.top + 30, margins.left, margins.right - 20)
        // Add exchange rate and date
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `EXCHANGE RATE: USD > PHP ${exchangeRate}`,
            margins.left + companyColWidth + middleColWidth + rightColWidth - 5,
            vesselInfoY + 6,
            { align: 'right' }
        );
        doc.setFont('helvetica', 'italic');

        doc.text(
            dateGenerated,
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

        // -------------------------------------------------
        // TABLE HEADER - Draw on first page and any new pages
        // -------------------------------------------------

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
            const headers = ["CREW NAME", "RANK", "SALARY", "BASIC WAGE", "GROSS"];
            headers.forEach((header, index) => {
                const colX = colPositions[index];
                const colWidth = colWidths[index];
                doc.text(header, colX + colWidth / 2 + 12, currentY + tableHeaderHeight / 2 + 1, { align: 'center' });
            });

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


                addNewPage();
            }

            // Set font for crew data
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            // Draw horizontal line at the top of crew row
            if (crewIndex > 0) {
                doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
            }

            // Draw left and right borders only
            doc.line(margins.left, currentY, margins.left, currentY + rowHeight); // Left border
            doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight); // Right border

            // Draw crew data
            doc.text(crew.CrewName, colPositions[0] + 5, currentY + rowHeight / 2 + 1);
            doc.text(crew.Rank, colPositions[1] + colWidths[1] / 2 + 15, currentY + rowHeight / 2 + 1, { align: 'center' });
            doc.text(formatCurrency(crew.Salary), colPositions[2] + colWidths[2] - 5 + 10, currentY + rowHeight / 2 + 1, { align: 'right' });
            doc.text(formatCurrency(crew.Salary), colPositions[3] + colWidths[3] - 5 + 10, currentY + rowHeight / 2 + 1, { align: 'right' });
            doc.text(formatCurrency(crew.Gross), colPositions[4] + colWidths[4] - 5 + 10, currentY + rowHeight / 2 + 1, { align: 'right' });

            // Draw horizontal line at the bottom of crew row
            doc.line(margins.left, currentY + rowHeight, pageWidth - margins.right, currentY + rowHeight);

            // Move to next row
            currentY += rowHeight;

            // Process deductions for this crew
            if (crew.Deductions && crew.Deductions.length > 0) {
                crew.Deductions.forEach((deduction) => {
                    // Check if we need a new page
                    if (currentY + rowHeight > pageHeight - margins.bottom - 10) {
                        // Draw page number box at bottom of current page
                        doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
                        doc.setFontSize(9);
                        doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });


                        // Start a new page
                        addNewPage();
                    }

                    // Draw left and right borders only (no horizontal borders between deduction rows)
                    doc.line(margins.left, currentY, margins.left, currentY + rowHeight); // Left border
                    doc.line(pageWidth - margins.right, currentY, pageWidth - margins.right, currentY + rowHeight); // Right border

                    // Format the deduction details - important to use fixed positions that match the image
                    const currencyLabel = deduction.Currency === 1 ? "Usd" : "PhP";
                    const amountWithRate = `${formatCurrency(deduction.Amount)}/${formatCurrency(deduction.ExchangeRate)}`;

                    // Calculate dollar amount based on currency
                    const dollarAmount = deduction.Currency === 1
                        ? deduction.Amount
                        : deduction.Amount / deduction.ExchangeRate;

                    // Define fixed positions for deduction details based on the sample image
                    // These positions are what we need to fix to display the details correctly
                    const namePosition = margins.left + mainTableWidth * 0.5; // Deduction name position
                    const currencyPosition = margins.left + mainTableWidth * 0.7; // Currency label position
                    const amountPosition = margins.left + mainTableWidth * 0.8; // Amount/rate position

                    // Draw deduction details using fixed positions
                    doc.text(deduction.Name, namePosition + 20, currentY + rowHeight / 2 + 1);
                    doc.text(currencyLabel, currencyPosition + 12, currentY + rowHeight / 2 + 1);
                    doc.text(amountWithRate, amountPosition + 6, currentY + rowHeight / 2 + 1);
                    doc.text(formatCurrency(dollarAmount), pageWidth - margins.right - 5, currentY + rowHeight / 2 + 1, { align: 'right' });

                    // Move to next row without drawing horizontal line
                    currentY += rowHeight;
                });

                // Draw horizontal line after last deduction for this crew
                doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
            }
        });

        // Draw page number box at bottom of last page
        doc.rect(margins.left, pageHeight - margins.bottom - 10, mainTableWidth, 10);
        doc.setFontSize(9);
        doc.text(`Page ${currentPage} out of ${totalPages}`, pageWidth - margins.right - 5, pageHeight - margins.bottom - 3, { align: 'right' });

        // Add footer with current date/time and user on last page
        // doc.setFontSize(8);
        // doc.setFont('helvetica', 'italic');
        // doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + getCurrentDateTime(), margins.left, pageHeight - margins.bottom - 20);
        // doc.text("Current User's Login: " + currentUser, margins.left, pageHeight - margins.bottom - 15);

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
        // "lanceballicud" // Current user
    );
}

// Default export for easy importing
export default generateDeductionRegister;