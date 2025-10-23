import AllotmentPayslip from "@/components/pages/allotment_payroll/AllotmentPayslip";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllotmentPayslip />;
    </Suspense>
  );
}
