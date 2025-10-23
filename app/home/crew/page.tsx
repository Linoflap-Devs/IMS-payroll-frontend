import CrewList from "@/components/pages/CrewList";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <CrewList/>
    </Suspense>
  );
}