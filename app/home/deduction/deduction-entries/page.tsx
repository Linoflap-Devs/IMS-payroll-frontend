import AccessGuard from "@/components/pages/AccessGuard";
import DeductionEntries from "@/components/pages/DeductionEntries";
import { Suspense } from "react";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 5]}>
      <Suspense fallback={<div>Loading...</div>}>
        <DeductionEntries />;
      </Suspense>
    </AccessGuard>
  );
}
