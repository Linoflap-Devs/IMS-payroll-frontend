"use client"; // Ensure client-side only execution

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";

// Define types to match your data structure
interface AllotmentDeduction {
    name: string;
    currency: string;
    amount: number;
    forex: number;
    dollar: number;
}

interface AllotteeDistribution {
    name: string;
    amount: number;
    currency: string | number;
}

interface PayrollDetail {
    basicWage: number;
    fixedOT: number;
    guaranteedOT: number;
    dollarGross: number;
    pesoGross: number;
    totalDeduction: number;
    netWage: number;
}

interface CrewPayroll {
    crewId: number;
    crewCode: string;
    crewName: string;
    rank: string;
    payrollDetails: PayrollDetail;
    allotmentDeductions: AllotmentDeduction[];
    allotteeDistribution: AllotteeDistribution[];
}

interface PayrollData {
    vesselName: string;
    period: {
        month: number;
        year: number;
        startDate: string;
        endDate: string;
        formattedPeriod: string;
    };
    summary: {
        crewCount: number;
        totalBasicWage: number;
        totalFOT: number;
        totalGOT: number;
        totalDollarGross: number;
        totalPesoGross: number;
        totalDeductions: number;
        totalNetAllotment: number;
    };
    payrolls: CrewPayroll[];
}

// Format currency with commas and 2 decimal places
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format currency with appropriate symbol for consistent display
function formatWithCurrency(amount: number, currencyType: string): string {
    // Use text-based currency prefixes instead of symbols for better compatibility
    if (currencyType === 'PHP') {
        return "₱ " + formatCurrency(amount);
    } else {
        return "$ " + formatCurrency(amount);
    }
}

// Format date in specified format: YYYY-MM-DD HH:MM:SS
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Main function that generates a single PDF with all crew members
export function generatePayrollPDF(payrollData: PayrollData, currentUser: string = 'admin') {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!payrollData || !payrollData.payrolls || !payrollData.payrolls.length) {
        console.error('Invalid payroll data');
        return false;
    }

    try {
        console.log(`Generating PDF with ${payrollData.payrolls.length} crew members`);

        // Create a single PDF document for all crew members
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        addFont(doc);

        // Set document properties for the combined PDF
        doc.setProperties({
            title: `Payroll Statement - ${payrollData.vesselName} - ${payrollData.period.formattedPeriod}`,
            subject: `Payroll Statements for ${payrollData.vesselName}`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        // Generate each crew member's page in the same PDF
        payrollData.payrolls.forEach((crew, index) => {
            // Add a new page for each crew member after the first one
            if (index > 0) {
                doc.addPage();
            }

            // Generate the page for this crew member
            generateCrewPayrollPage(doc, payrollData, crew, currentUser);
        });

        // Save the combined PDF
        const fileName = `payroll-${payrollData.vesselName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${payrollData.period.formattedPeriod.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        doc.save(fileName);

        console.log(`Successfully generated combined PDF with ${payrollData.payrolls.length} crew members`);
        return true;
    } catch (error) {
        console.error("Error in PDF generation process:", error);
        return false;
    }
}

// Generate a single page for a crew member
function generateCrewPayrollPage(doc: jsPDF, payrollData: PayrollData, crewData: CrewPayroll, currentUser: string) {
    // Define page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let y = margin;
    doc.setFont('NotoSans', 'normal');



    // Company header section
    doc.rect(margin, y, pageWidth - margin * 2, 30);

    // Logo placeholder (replace with your actual logo when available)
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 5, y + 5, 20, 20, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("LOGO", margin + 15, y + 15, { align: 'center' });

    // Reset colors
    doc.setDrawColor(0);
    doc.setTextColor(0);

    // Company header text
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    doc.text("IMS PHILIPPINES", margin + 35, y + 13);
    doc.text("MARITIME CORP.", margin + 35, y + 20);

    // Add period box on top right
    doc.setFontSize(10);
    doc.setFont('NotoSans', 'normal');
    doc.rect(pageWidth - 60, y, 50, 15);
    doc.text(payrollData.period.formattedPeriod, pageWidth - 55, y + 9);

    // Add payroll statement box
    doc.rect(pageWidth - 60, y + 15, 50, 15);
    doc.text("PAYROLL STATEMENT", pageWidth - 55, y + 23);

    // Add crew and vessel information
    y += 30;
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 15);

    // Crew information
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("CREW", margin + 2, y + 5);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(11);
    doc.setFont('NotoSans', 'bold');
    doc.text(`${crewData.rank} / ${crewData.crewName}`, margin + 2, y + 12);

    // Vessel information
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('NotoSans', 'italic');
    doc.text("VESSEL", pageWidth - 24, y + 5);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('NotoSans', 'bold');
    doc.text(payrollData.vesselName, pageWidth - 12, y + 12, { align: 'right' });

    // Horizontal gray line
    y += 20;
    doc.setDrawColor(180);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineWidth(0.1);

    // Payroll Details section
    y += 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 12);
    doc.setFont('NotoSans', 'bold');
    doc.text("PAYROLL DETAILS", margin + 2, y + 7.5);

    // Payroll items
    y += 17;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);

    const payrollItems = [
        ["Basic Wage", formatWithCurrency(crewData.payrollDetails.basicWage, "USD")],
        ["Fixed OT", formatWithCurrency(crewData.payrollDetails.fixedOT, "USD")],
        ["Guar. OT", formatWithCurrency(crewData.payrollDetails.guaranteedOT, "USD")],
        ["Dollar Gross", formatWithCurrency(crewData.payrollDetails.dollarGross, "USD")],
        ["Peso Gross", formatWithCurrency(crewData.payrollDetails.pesoGross, "PHP")],
        ["Total Deduction", formatWithCurrency(crewData.payrollDetails.totalDeduction, "PHP")]
    ];

    payrollItems.forEach((item, index) => {
        doc.text(item[0], margin + 2, y + 1 + index * 8);
        doc.text(item[1], pageWidth - 12, y + index * 8, { align: 'right' });
    });

    // Horizontal line after payroll details
    y += payrollItems.length * 8 - 4;
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);

    // Net wage line with light gray background
    y += 8;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');
    doc.setFont('NotoSans', 'bold');
    doc.text("NET WAGE :", margin + 2, y);
    doc.text(formatWithCurrency(crewData.payrollDetails.netWage, "PHP"), pageWidth - 12, y, { align: 'right' });

    // Horizontal gray line
    y += 8;
    doc.setDrawColor(180);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineWidth(0.1);

    // Allotment Deductions section
    y += 4;
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 12);

    // Column headers for deductions
    const colWidth = (pageWidth - margin * 2) / 5;
    doc.text("ALLOTMENT DEDUCTIONS", margin + 2, y + 8);
    doc.text("CURRENCY", margin + colWidth, y + 8);
    doc.text("AMOUNT", margin + colWidth * 2, y + 8);
    doc.text("FOREX", margin + colWidth * 3, y + 8);
    doc.text("DOLLAR", margin + colWidth * 4, y + 8);

    // Deduction items
    y += 17;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);

    crewData.allotmentDeductions.forEach((deduction, index) => {
        doc.text(deduction.name, margin + 2, y + index * 8);
        doc.text(deduction.currency, margin + colWidth, y + index * 8);
        doc.text(formatCurrency(deduction.amount), margin + colWidth * 2, y + index * 8);

        // Format forex with PHP instead of peso sign
        const forexText = deduction.forex ? "PHP " + formatCurrency(deduction.forex) : "";
        doc.text(forexText, margin + colWidth * 3, y + index * 8);

        doc.text(formatCurrency(deduction.dollar), pageWidth - 12, y + index * 8, { align: 'right' });
    });

    // Horizontal line after deductions
    y += crewData.allotmentDeductions.length * 8 + 5;
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);

    // Total deductions
    y += 5;
    doc.setFont('NotoSans', 'bold');
    doc.text("Total :", margin + 2, y);
    doc.text(formatWithCurrency(crewData.payrollDetails.totalDeduction, "PHP"), pageWidth - 12, y, { align: 'right' });

    // Horizontal gray line
    y += 5;
    doc.setDrawColor(180);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineWidth(0.1);

    // Allottee Distribution section
    y += 5;
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.rect(margin, y, pageWidth - margin * 2, 12);

    doc.text("ALLOTTEE DISTRIBUTION", margin + 2, y + 7.5);
    doc.text("NET ALLOTMENT", pageWidth - 12, y + 7.5, { align: 'right' });

    // Allottee items
    y += 20;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);

    crewData.allotteeDistribution.forEach((allottee, index) => {
        doc.text(allottee.name, margin + 2, y + index * 8);

        // Format currency based on type, but use text notation instead of symbols
        let currencyType = 'PHP';
        if (typeof allottee.currency === 'string' && allottee.currency === 'USD') {
            currencyType = 'USD';
        } else if (allottee.currency === 1) {
            currencyType = 'USD';
        }

        doc.text(formatWithCurrency(allottee.amount, currencyType), pageWidth - 12, y + index * 8, { align: 'right' });
    });

    // Footer
    y = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'italic');

    // Use your specified format for date/time and user
    doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + formatDate(new Date()), margin, y);
    doc.text("Current User's Login: " + currentUser, margin, y + 5);
    doc.text("(This is a system generated document and does not require signature)", margin, y + 10);
}