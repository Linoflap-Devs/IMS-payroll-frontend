import AccessGuard from "@/components/pages/AccessGuard";
import VesselMovement from "@/components/pages/VesselMovement";
import { Suspense } from "react";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Suspense fallback={<div>Loading...</div>}>
        <VesselMovement />
      </Suspense>
    </AccessGuard>
  );
}
