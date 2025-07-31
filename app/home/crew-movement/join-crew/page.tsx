import AccessGuard from "@/components/pages/AccessGuard";
import JoinCrew from "@/components/pages/JoinCrew";
import { Suspense } from "react";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Suspense fallback={<div>Loading...</div>}>
        <JoinCrew />
      </Suspense>
    </AccessGuard>
  );
}
