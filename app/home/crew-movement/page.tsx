import AccessGuard from "@/components/pages/AccessGuard";
import CrewMovement from "@/components/pages/CrewMovement";
import { Suspense } from "react";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Suspense fallback={<div>Loading...</div>}>
        <CrewMovement />
      </Suspense>
    </AccessGuard>
  );
}
