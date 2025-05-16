"use client";

import DeductionRegister from "@/components/pages/allotment_payroll/DeductionRegister";
import { Suspense } from "react";

export default function page() {
  return <Suspense fallback={<div>Loading...</div>}>

    <DeductionRegister />;

  </Suspense> 
}
