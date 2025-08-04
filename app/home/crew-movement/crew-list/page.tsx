import AccessGuard from "@/components/pages/AccessGuard";
import CrewMovementCrew from "@/components/pages/CrewMovementList";
import { Suspense } from "react";

export default function VesselCrewListPage() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Suspense fallback={<div>Loading...</div>}>
        <CrewMovementCrew />
      </Suspense>
    </AccessGuard>
  );
}
