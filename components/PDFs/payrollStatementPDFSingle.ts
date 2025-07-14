"use client"; // Ensure client-side only execution

import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { addFont } from "./lib/font";
import { logoBase64Image } from "./lib/base64items";
import { toast } from "../ui/use-toast";
import { CrewPayroll, PayslipPeriod, Payroll, PayslipData } from "@/src/services/payroll/payroll.api";
import { format } from "date-fns";

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

export function generatePayrollPDFSingle(
    payslipData: CrewPayroll,
    month: number,
    year: number,
    currentUser: string = 'admin',
): boolean {
    if (typeof window === 'undefined') {
        console.warn('PDF generation attempted during server-side rendering');
        return false;
    }

    if (!payslipData) {
        toast({
            title: 'Error',
            description: 'No payroll data available to generate PDF.',
            variant: 'destructive'
        });
        return false;
    }

    try {

        // Create a single PDF document for all crew members
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        addFont(doc);

        // Set document properties for the combined PDF
        const pdfTitle = `Payroll Statement - ${payslipData.crewName} - ${month} ${year}`

        doc.setProperties({
            title: pdfTitle,
            subject: `Payroll Statement for ${payslipData.crewName}`,
            author: 'IMS Philippines Maritime Corp.',
            creator: 'jsPDF'
        });

        const dateFormat = format(new Date(year, month, 1), 'MMMM yyyy')

        generateCrewPayrollPage(doc, dateFormat, payslipData.vesselName, payslipData, currentUser);
        // If no pages were generated, return false
        // if (firstPage) {
        //     toast({
        //         title: 'Error',
        //         description: 'No crew members found in the selected vessel(s).',
        //         variant: 'destructive'
        //     });
        //     return false;
        // }

        // Generate filename based on selected vessels
        let fileName: string;
        fileName=`Payroll-${payslipData.crewName.replace(' ','_')}-${month}_${year}`

        // Save the combined PDF
        doc.save(fileName);
        return true;
    } catch (error) {
        console.error("Error in PDF generation process:", error);
        toast({
            title: 'Error',
            description: 'Failed to generate PDF. Please try again.',
            variant: 'destructive'
        });
        return false;
    }
}

function generateCrewPayrollPage(
    doc: jsPDF,
    period: string,
    vessel: string,
    crewData: CrewPayroll,
    currentUser: string
) {
    // Define page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let y = margin;
    doc.setFont('NotoSans', 'normal');

    // Company header section
    doc.rect(margin, y, pageWidth - margin * 2, 30);

    // Logo
    doc.addImage(logoBase64Image, 'PNG', margin, y, 30, 30);

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
    doc.text(period, pageWidth - 55, y + 9);

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
    doc.text(vessel, pageWidth - 12, y + 12, { align: 'right' });

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
    doc.text("ALLOTMENT DEDUCTIONS", margin + 2, y + 7.5);
    doc.text("CURRENCY", margin + colWidth * 1.8, y + 7.5);
    doc.text("AMOUNT", margin + colWidth * 2.8, y + 7.5);
    doc.text("FOREX", margin + colWidth * 3.7, y + 7.5);
    doc.text("PESO", margin + colWidth * 4.5, y + 7.5);

    // Deduction items
    y += 17;
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);

    if (crewData.allotmentDeductions && crewData.allotmentDeductions.length > 0) {
        crewData.allotmentDeductions.forEach((deduction, index) => {
            doc.text(deduction.name, margin + 2, y + index * 8);
            doc.text(deduction.currency, margin + colWidth * 1.8, y + index * 8);
            doc.text(formatCurrency(deduction.amount), margin + colWidth * 2.8, y + index * 8);

            // Format forex with PHP instead of peso sign
            const forexText = deduction.forex ? "PHP " + formatCurrency(deduction.forex) : "";
            doc.text(forexText, margin + colWidth * 3.7, y + index * 8);

            doc.text(formatCurrency(deduction.dollar), margin + colWidth * 4.5, y + index * 8);
        });

        // Horizontal line after deductions
        y += crewData.allotmentDeductions.length * 8 + 5;
    } else {
        // No deductions - show a message
        y += 8;
        doc.text("No deductions found", margin + 2, y);
        y += 13; // Move down a bit
    }

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

    if (crewData.allotteeDistribution && crewData.allotteeDistribution.length > 0) {
        crewData.allotteeDistribution.forEach((allottee, index) => {
            doc.text(allottee.name, margin + 2, y + index * 8);

            // Format currency based on type, but use text notation instead of symbols
            let currencyType = 'PHP';
            if (typeof allottee.currency === 'string' && allottee.currency === 'USD') {
                currencyType = 'USD';
            } else if (allottee.currency === 1) {
                currencyType = 'USD';
            }

            //const toPeso = allottee.currency === 1 ? allottee.amount * exchangeRate : allottee.amount;

            doc.text(formatWithCurrency(allottee.amount, 'PHP'), pageWidth - 12, y + index * 8, { align: 'right' });
        });
    } else {
        // No allottees - show a message
        doc.text("No allottee distributions found", margin + 2, y);
    }

    // Footer
    y = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('NotoSans', 'italic');

    // Use your specified format for date/time and user
    doc.text("Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): " + formatDate(new Date()), margin, y);
    doc.text("Current User's Login: " + currentUser, margin, y + 5); 
    doc.text("(This is a system generated document and does not require signature)", margin, y + 10);
}