"use client";

import AccessGuard from "@/components/pages/AccessGuard";
import AllotmentRegister from "@/components/pages/allotment_payroll/AllotmentRegister";
import { Suspense } from "react";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <Suspense fallback={<div> Loading... </div>}>
        <AllotmentRegister />;
      </Suspense>
    </AccessGuard>
  );
}
