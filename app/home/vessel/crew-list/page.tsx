import VesselCrewList from "@/components/pages/VesselCrewList";
import { Suspense } from "react";

export default function VesselCrewListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VesselCrewList />
    </Suspense>
  );
}
