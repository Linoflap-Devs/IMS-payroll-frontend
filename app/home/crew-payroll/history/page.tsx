import CrewPayrollHistory from "@/components/pages/CrewPayrollHistory";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <CrewPayrollHistory />
    </Suspense>
  );
}
