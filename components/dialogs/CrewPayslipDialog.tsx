import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CrewPayrollHistoryItem } from "@/src/services/payroll/crewPayrollHistory.api";

interface CrewPayslipDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewPayroll: CrewPayrollHistoryItem | null;
}

export function CrewPayslipDistribution({
  open,
  onOpenChange,
  crewPayroll,
}: CrewPayslipDistributionDialogProps) {
  const columns: ColumnDef<CrewPayrollHistoryItem>[] = [
    {
      accessorKey: "Name",
      header: "Deduction Name",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-[#FCFCFC]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-[#2E37A4]"></DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <DataTable columns={columns} data={[]} pageSize={5} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
