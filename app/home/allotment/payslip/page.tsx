import AccessGuard from "@/components/pages/AccessGuard";
import AllotmentPayslip from "@/components/pages/allotment_payroll/AllotmentPayslip";
import { Suspense } from "react";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <Suspense fallback={<div>Loading...</div>}>
        <AllotmentPayslip />;
      </Suspense>
    </AccessGuard>
  );
}
