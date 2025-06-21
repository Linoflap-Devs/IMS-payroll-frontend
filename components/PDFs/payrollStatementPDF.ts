// Import necessary libraries
// Make sure to include jspdf and jspdf-autotable in your project
// npm install jspdf jspdf-autotable

import { jsPDF } from "jspdf";
import 'jspdf-autotable';

export function generatePayrollPDF() {

    // Create a new PDF document (using A4 size in portrait orientation)
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Set document properties
    doc.setProperties({
        title: 'Payroll Statement',
        subject: 'Payroll Statement for Captain Dela Cruz, Juan',
        author: 'IMS Philippines Maritime Corp.',
        creator: 'jsPDF'
    });

    // Define page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let y = margin;

    // Add company logo (placeholder - you would need to replace with actual logo)
    // For demonstration, draw a green circle with red banner to simulate the logo


    // Company header section

    doc.rect(margin, y, pageWidth - margin * 2, 30);
    doc.addImage("PLACEHOLDER", 'PNG', margin, y, 30, 30);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("IMS PHILIPPINES", margin + 35, y + 13);
    doc.text("MARITIME CORP.", margin + 35, y + 20);

    // Add date box on top right
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(0);
    doc.rect(pageWidth - 60, y, 50, 15);
    doc.text("FEBRUARY 2025", pageWidth - 55, y + 9);

    // Add payroll statement box
    doc.setDrawColor(0);
    doc.rect(pageWidth - 60, y + 15, 50, 15);
    doc.text("PAYROLL STATEMENT", pageWidth - 55, y + 23);

    // Add crew and vessel information
    y += 30;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 15);

    // Draw divider line in the middle
    // doc.line(pageWidth / 2, y, pageWidth / 2, y + 15);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text("CREW", margin + 2, y + 5);
    doc.setTextColor(0, 0, 0);


    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("CAPTAIN / DELA CRUZ, JUAN", margin + 2, y + 12);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');

    doc.text("VESSEL", pageWidth - 24, y + 5,);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');

    doc.text("CALLUNA GAS HEHE", pageWidth - 12, y + 12, { align: 'right' });

    // Horizontal gray line
    y += 20;
    doc.setDrawColor(180);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);

    // Payroll Details section
    y += 5;
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 12);
    doc.setFont('helvetica', 'bold');
    doc.text("PAYROLL DETAILS", margin + 2, y + 7.5);

    // Payroll items
    y += 17;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const payrollItems = [
        ["Basic Wage", "Dollar", "Dollar 2,172.00"],
        ["Fixed OT", "Dollar", "Dollar 00.00"],
        ["Guar. OT", "Dollar", "Dollar 00.00"],
        ["Dollar Gross", "Dollar", "Dollar 2,172.00"],
        ["Peso Gross", "PHP", "PHP 124,529.76"],
        ["Total Deduction", "PHP", "PHP 4,450.00"]
    ];

    payrollItems.forEach((item, index) => {
        doc.text(item[0], margin + 2, y + 1 + index * 8);
        // doc.text(item[1], pageWidth - margin - doc.getTextWidth(item[1]), y + index * 8);
        // doc.text(item[1], pageWidth - doc.getTextWidth(item[2]) - 2, y + index * 8, { align: 'right' });
        doc.text(item[2], pageWidth - 12, y + index * 8, { align: 'right' });

    });

    y += payrollItems.length * 8 - 4;
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);

    // Net wage line with light gray background
    y += 8;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text("NET WAGE :", margin + 2, y);
    doc.text("PHP 120,070.76", pageWidth - 12, y, { align: 'right' });

    // Horizontal gray line
    y += 8;
    doc.setDrawColor(180);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    // Allotment Deductions section
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, pageWidth - margin * 2, 12);

    // Column headers
    const colWidth = (pageWidth - margin * 2) / 5;
    doc.text("ALLOTMENT DEDUCTIONS", margin + 2, y + 8);
    doc.text("CURRENCY", margin + colWidth, y + 8);
    doc.text("AMOUNT", margin + colWidth * 2, y + 8);
    doc.text("FOREX", margin + colWidth * 3, y + 8);
    doc.text("DOLLAR", margin + colWidth * 4, y + 8);

    // Deduction items
    y += 17;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const deductionItems = [
        ["Cash Advance", "USD", "7.78", "", "7.78"],
        ["SSS Contributions", "PHP", "17.29", "(PHP) 57.84", "1000.00"],
        ["Pag-ibig Contributions", "PHP", "17.29", "(PHP) 57.84", "1000.00"],
        ["PhilHealth Contributions", "PHP", "42.20", "(PHP) 57.84", "1000.00"],
        ["SSS Provident", "PHP", "12.97", "(PHP) 57.84", "1000.00"]
    ];

    deductionItems.forEach((item, index) => {
        doc.text(item[0], margin, y + index * 8);
        doc.text(item[1], margin + colWidth, y + index * 8);
        doc.text(item[2], margin + colWidth * 2, y + index * 8);
        doc.text(item[3], margin + colWidth * 3, y + index * 8);
        doc.text(item[4], pageWidth - margin - doc.getTextWidth(item[4]), y + index * 8);
    });

    // Horizontal line after deductions
    y += deductionItems.length * 8 + 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);

    // Total deductions
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("Total :", margin, y);
    doc.text("₱4,450.00", pageWidth - margin - doc.getTextWidth("₱4,450.00"), y);

    // Horizontal gray line
    y += 10;
    doc.setDrawColor(180);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    // Allottee Distribution section
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.rect(margin, y, pageWidth - margin * 2, 12);

    doc.text("ALLOTTEE DISTRIBUTION", margin + 2, y + 8);
    doc.text("NET ALLOTMENT", pageWidth - margin - doc.getTextWidth("NET ALLOTMENT") - 10, y + 8);

    // Allottee items
    y += 17;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const allotteeItems = [
        ["Dela Cruz, Anna", "₱50,000.00"],
        ["Dela Cruz, Jimmy", "₱70,070.76"]
    ];

    allotteeItems.forEach((item, index) => {
        doc.text(item[0], margin, y + index * 8);
        doc.text(item[1], pageWidth - margin - doc.getTextWidth(item[1]), y + index * 8);
    });

    // Footer
    y = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("03/10/2025 03:46:20 PM", margin, y);
    doc.text("(This is a system generated document and does not required signature", margin, y + 5);

    // Save the PDF
    doc.save("payroll-statement.pdf");
}

// Call the function to generate the PDF
generatePayrollPDF();