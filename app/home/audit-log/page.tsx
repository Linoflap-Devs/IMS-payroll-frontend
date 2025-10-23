import AuditLog from "@/components/pages/allotment_payroll/AuditLog";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <AuditLog/>
    </Suspense>
  );
}