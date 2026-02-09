import SalaryScale from "@/components/pages/SalaryScale";
import { Suspense } from "react";

export default function page() {
  return (
     <Suspense fallback={<div></div>}>
      <SalaryScale />
    </Suspense>
  );
}