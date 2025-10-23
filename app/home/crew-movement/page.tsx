import CrewMovement from "@/components/pages/CrewMovement";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CrewMovement />
    </Suspense>
  );
}
