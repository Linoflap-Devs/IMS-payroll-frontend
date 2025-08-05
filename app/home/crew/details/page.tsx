import AccessGuard from "@/components/pages/AccessGuard";
import CrewDetails from "@/components/pages/CrewDetails";
import { Suspense } from "react";

export default function CrewDetailsPage() {
  return (
    <AccessGuard allowedTypes={[3, 5]}>
      <Suspense fallback={<div>Loading...</div>}>
        <CrewDetails />
      </Suspense>
    </AccessGuard>
  );
}
