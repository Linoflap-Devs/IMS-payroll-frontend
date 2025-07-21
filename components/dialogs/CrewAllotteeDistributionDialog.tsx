import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CrewPayrollHistoryItem } from "@/src/services/payroll/crewPayrollHistory.api";

interface CrewAllotteeDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewPayroll: CrewPayrollHistoryItem | null;
}

interface AllotteeDistribution {
  name: string;
  accountNumber: string;
  bank: string;
  amount: number;
  currency: number;
}

export function CrewAllotteeDistribution({
  open,
  onOpenChange,
  crewPayroll,
}: CrewAllotteeDistributionDialogProps) {
  console.log('CREW PAYROLL DATA IN THE CREW ALLOTTEE DIALOG: ', crewPayroll);

  const columns: ColumnDef<AllotteeDistribution>[] = [
    {
      accessorKey: "name",
      header: "Allottee Name",
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
    },
    {
      accessorKey: "bank",
      header: "Bank",
    },
    {
      accessorKey: "amount",
      header: "Allotment",
      cell: ({ row }) => `₱ ${Number(row.original.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]">Allottee Distribution</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <DataTable 
            columns={columns} 
            data={crewPayroll?.allotteeDistribution || []} 
            pageSize={5} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// can i display the fields here in the table there?:
// fields: 
// Allottee Name 
// Account Number
// Bank
// Allotment

// this is the data:
// Object PayrollMonth : 6 PayrollYear : 2025 PostedPayrollID : 1254 allotmentDeductions : Array(4) 0 : {name: 'SSS Contribution', currency: 'PHP', amount: '1000', forex: 56.65, dollar: '1000'} 1 : {name: 'SSS Provident', currency: 'PHP', amount: '750', forex: 56.65, dollar: '1000'} 2 : {name: 'PhilHealth Contribution', currency: 'PHP', amount: '2113.05', forex: 56.65, dollar: '1000'} 3 : {name: 'Pag-Ibig Contribution', currency: 'PHP', amount: '2000', forex: 56.65, dollar: '1000'} length : 4 [[Prototype]] : Array(0) allotteeDistribution : Array(2) 0 : {name: 'CARRERA, JENY JOY MOLINA', amount: 64500, currency: 0, bank: 'BPI-MAGALLANES NORTH', accountNumber: '3539-1667-69'} 1 : {name: 'CARRERA, JOSEPH CLIFTON S.', amount: 78162.91, currency: 0, bank: 'BPI-DEWEY', accountNumber: '4939-4787-82'} length : 2 [[Prototype]] : Array(0) crewCode : "2332" crewId : 2177 crewName : "CARRERA, JOSEPH CLIFTON S." payrollDetails : {basicWage: '1492', fixedOT: '1110.4', guaranteedOT: '0', dollarGross: '2602.4', pesoGross: '147425.96', …} rank : "C/OFF " vesselId : 29 vesselName : "SJ CORAL" [[Prototype]] : Object