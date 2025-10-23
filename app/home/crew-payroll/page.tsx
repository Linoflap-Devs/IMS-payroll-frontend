import CrewPayroll from "@/components/pages/CrewPayroll";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <CrewPayroll />
    </Suspense>
  );
}
