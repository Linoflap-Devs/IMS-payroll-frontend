import CrewDetails from "@/components/pages/CrewDetails";
import { Suspense } from "react";

export default function CrewDetailsPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <CrewDetails />;
  </Suspense>
}
