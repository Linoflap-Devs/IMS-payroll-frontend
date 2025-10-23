import VesselProfile from "@/components/pages/VesselProfile";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VesselProfile />
    </Suspense>
  );
}
