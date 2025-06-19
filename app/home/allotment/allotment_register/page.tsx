"use client";

import AllotmentRegister from "@/components/pages/allotment_payroll/AllotmentRegister";
import { Suspense } from "react";

export default function page() {
  return  <Suspense fallback={<div> Loading... </div>}>
            <AllotmentRegister />;
          </Suspense>
}
