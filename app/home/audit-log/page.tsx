import AccessGuard from "@/components/pages/AccessGuard";
import AuditLog from "@/components/pages/allotment_payroll/AuditLog";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[1]}>
      <AuditLog/>
    </AccessGuard>
  );
}