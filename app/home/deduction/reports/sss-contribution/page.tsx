import SSSContribution from "@/components/pages/SSSContribution";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SSSContribution />
    </Suspense>
  );
}
