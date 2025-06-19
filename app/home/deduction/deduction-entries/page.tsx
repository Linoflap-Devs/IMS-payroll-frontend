import DeductionEntries from "@/components/pages/DeductionEntries";
import { Suspense } from "react";

export default function page() {
  return  <Suspense fallback={<div>Loading...</div>}>
            <DeductionEntries />;
          </Suspense>
}
