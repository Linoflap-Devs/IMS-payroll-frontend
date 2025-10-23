import CrewMovementCrew from "@/components/pages/CrewMovementList";
import { Suspense } from "react";

export default function VesselCrewListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CrewMovementCrew />
    </Suspense>
  );
}
