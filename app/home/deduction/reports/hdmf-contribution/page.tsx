import HMDFContribution from "@/components/pages/HDMFContributions";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HMDFContribution />
    </Suspense>
  );
}
