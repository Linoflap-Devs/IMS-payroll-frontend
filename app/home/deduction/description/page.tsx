import DeductionDescription from "@/components/pages/DeductionDescription";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeductionDescription />
    </Suspense>
  );
}
