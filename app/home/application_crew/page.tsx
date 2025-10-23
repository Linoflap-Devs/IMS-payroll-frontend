import CrewApplication from "@/components/pages/CrewApplication";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <CrewApplication />
    </Suspense>
  );
}
