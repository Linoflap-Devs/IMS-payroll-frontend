import AccessGuard from "@/components/pages/AccessGuard";
import DeductionRegister from "@/components/pages/allotment_payroll/DeductionRegister";
import { Suspense } from "react";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <Suspense fallback={<div>Loading...</div>}>
        <DeductionRegister />
      </Suspense>
    </AccessGuard>
  );
}
