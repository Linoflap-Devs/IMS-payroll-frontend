import CrewEntries from "@/components/pages/CrewEntries";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CrewEntries />
    </Suspense>
  );
}
