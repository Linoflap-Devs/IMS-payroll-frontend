import PhilhealthContribution from "@/components/pages/PhilhealthContribution";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhilhealthContribution />
    </Suspense>
  );
}
