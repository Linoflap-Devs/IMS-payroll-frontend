interface InfoDetail {
  Name: string;
  Rank: string;
  Vessel: string;
}

interface DatePeriod {
  start: string;
  end: string;
  month: string;
  year: string;
}

interface Payroll {
  BasicWage: number;
  FixedOut: number;
  GuaranteedOut: number;
  DollarGross: number;
  PesoGross: number;
  TotalDeductions: number;
  Net: number;
}

interface Deductions {
  SssContribution: number;
  PagibigContribution: number;
  PhilhealthContribution: number;
  SssProvident: number;
  Deductions: number;
  Total: number;
  CashAdvance: CashAdvanceData;
}

interface CashAdvanceData {
  amount: number;
  convertedAmount: number;
  currency: string;
}

interface Allottee {
  AllotteeName: string;
  NetAllotment: number;
  Currency: number;
}

interface getPayslipHtmlProps {
  Info: InfoDetail;
  DatePeriod: DatePeriod;
  Payroll: Payroll;
  Deductions: Deductions;
  Allottees: Allottee[];
}

const logoBase64Image =
  "data:image/png;base64,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";

export function getPayslipHtml(data: getPayslipHtmlProps) {
  const formatCurrency = (value: number, symbol = "$") =>
    `${symbol} ${value.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payroll Statement</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }
      .container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
      }
      td {
        padding: 8px;
        vertical-align: top;
      }
      .header-table {
        margin-bottom: 0;
      }
      .info-table {
        margin-top: 0;
        margin-bottom: 0;
      }
      .payroll-table {
        margin-top: 15px;
        margin-bottom: 0;
      }
      .payroll-header {
        border: 1px solid #000;
        font-weight: bold;
        background-color: #f8f8f8;
        text-align: left;
      }
      .payroll-row td {
        border-bottom: 1px solid #ddd;
      }
      .net-wage {
        background-color: #f0f0f0;
      }
      .deduction-header td {
        border: 1px solid #000;
        font-weight: bold;
        background-color: #f8f8f8;
        text-align: center;
      }
      .deduction-row td {
        border-bottom: 1px solid #ddd;
      }
      .logo-container {
        display: flex;
        align-items: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        position: relative;
        overflow: hidden;
        margin-right: 10px;
      }
      .small-text {
        font-size: 11px;
        color: #666;
      }
      .right-align {
        text-align: right;
      }
      .footer {
        margin-top: 5px;
        font-size: 11px;
        font-style: italic;
        color: #666;
      }
      hr {
        border: none;
        height: 1px;
        background-color: #aaa;
        margin: 15px 0;
      }
    </style>
</head>
<body>
  <div class="container">
    <!-- Header Table -->
    <table class="header-table" border="1">
      <tr>
        <td style="padding: 0;">
          <img src='${logoBase64Image}' alt="Logo" style="width: 100px; height: 100px; object-fit: cover;" />
        </td>
        <td width="70%">
          <div style="font-weight: bold">IMS PHILIPPINES</div>
          <div style="font-weight: bold">MARITIME CORP.</div>
        </td>
        <td width="30%" style="text-align: center;">
          <div>${data.DatePeriod.month} ${data.DatePeriod.year}</div>
          <br/>
          <div>PAYROLL STATEMENT</div>
        </td>
      </tr>
    </table>

    <!-- Info Table -->
    <table class="info-table" border="1">
      <tr>
        <td width="70%">
          <div class="small-text">CREW</div>
          <div>${data.Info.Rank} / ${data.Info.Name}</div>
        </td>
        <td width="30%">
          <div class="small-text right-align">VESSEL</div>
          <div class="right-align">${data.Info.Vessel}</div>
        </td>
      </tr>
    </table>

    <!-- Payroll Details Table -->
    <table class="payroll-table" border="1">
      <tr><td colspan="2" class="payroll-header">PAYROLL DETAILS</td></tr>
    </table>

    <table border="0">
      <tr class="payroll-row">
        <td width="70%">Basic Wage</td>
        <td width="30%" class="right-align">${formatCurrency(
    data.Payroll.BasicWage
  )}</td>
      </tr>
      <tr class="payroll-row">
        <td>Fixed OT</td>
        <td class="right-align">${formatCurrency(data.Payroll.FixedOut)}</td>
      </tr>
      <tr class="payroll-row">
        <td>Guar. OT</td>
        <td class="right-align">${formatCurrency(
    data.Payroll.GuaranteedOut
  )}</td>
      </tr>
      <tr class="payroll-row">
        <td>Dollar Gross</td>
        <td class="right-align">${formatCurrency(data.Payroll.DollarGross)}</td>
      </tr>
      <tr class="payroll-row">
        <td>Peso Gross</td>
        <td class="right-align">₱ ${data.Payroll.PesoGross.toFixed(2)}</td>
      </tr>
      <tr class="payroll-row">
        <td>Total Deduction</td>
        <td class="right-align">₱ ${data.Payroll.TotalDeductions.toFixed(
    2
  )}</td>
      </tr>
      <tr class="net-wage">
        <td><strong>NET WAGE :</strong></td>
        <td class="right-align"><strong>₱ ${data.Payroll.Net.toFixed(
    2
  )}</strong></td>
      </tr>
    </table>

    <hr />

    <!-- Deductions Table -->
 <table border="1" style="margin-top: 15px">
      <tr class="deduction-header">
        <td width="35%">ALLOTMENT DEDUCTIONS</td>
        <td width="15%">CURRENCY</td>
        <td width="15%">AMOUNT</td>
        <td width="15%">FOREX</td>
        <td width="20%">DOLLAR</td>
      </tr>
      <tr class="deduction-row">
        <td>Cash Advance</td>
        <td>USD</td>
        <td class="right-align">${data.Deductions.CashAdvance.amount.toFixed(
    2
  )}</td>
        <td class="right-align">-</td>
        <td class="right-align">${data.Deductions.CashAdvance.amount.toFixed(
    2
  )}</td>
      </tr>
      <tr class="deduction-row">
        <td>SSS Contributions</td>
        <td>PHP</td>
        <td class="right-align">${data.Deductions.SssContribution.toFixed(
    2
  )}</td>
        <td class="right-align">₱ 57.84</td>
        <td class="right-align">17.29</td>
      </tr>
      <tr class="deduction-row">
        <td>Pag-ibig Contributions</td>
        <td>PHP</td>
        <td class="right-align">${data.Deductions.PagibigContribution.toFixed(
    2
  )}</td>
        <td class="right-align">₱ 57.84</td>
        <td class="right-align">17.29</td>
      </tr>
      <tr class="deduction-row">
        <td>PhilHealth Contributions</td>
        <td>PHP</td>
        <td class="right-align">${data.Deductions.PhilhealthContribution.toFixed(
    2
  )}</td>
        <td class="right-align">₱ 57.84</td>
        <td class="right-align">42.20</td>
      </tr>
      <tr class="deduction-row">
        <td>SSS Provident</td>
        <td>PHP</td>
        <td class="right-align">${data.Deductions.SssProvident.toFixed(2)}</td>
        <td class="right-align">₱ 57.84</td>
        <td class="right-align">12.97</td>
      </tr>
      <tr class="deduction-row">
        <td colspan="4" style="text-align: left; border-bottom: 1px solid #000">
          <strong>Total :</strong>
        </td>
        <td class="right-align" style="border-bottom: 1px solid #000">
          <strong>97.53</strong>
        </td>
      </tr>
    </table>

    <!-- Allottee Distribution Table -->
    <table border="1" style="margin-top: 15px">
      <tr class="deduction-header">
        <td width="80%">ALLOTTEE DISTRIBUTION</td>
        <td width="20%">NET ALLOTMENT</td>
      </tr>
    </table>

    <table border="0">
      ${data.Allottees.map(
    (Allottee) => `
        <tr class="deduction-row">
          <td width="80%">${Allottee.AllotteeName}</td>
          <td width="20%" class="right-align"> ${Allottee.Currency == 0 ? "₱" : "$"
      } ${Allottee.NetAllotment.toFixed(2)}</td>
        </tr>
      `
  ).join("")}
    </table>

    <!-- Footer -->
    <div class="footer">
      <p>DATE GENERATED</p>
      <p>(This is a system generated document and does not require signature)</p>
    </div>
  </div>
</body>
</html>
  `;
}
