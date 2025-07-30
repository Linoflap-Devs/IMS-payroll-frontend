import AccessGuard from "@/components/pages/AccessGuard";
import VesselCrewList from "@/components/pages/VesselCrewList";
import { Suspense } from "react";

export default function VesselCrewListPage() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Suspense fallback={<div>Loading...</div>}>
        <VesselCrewList />
      </Suspense>
    </AccessGuard>
  );
}
