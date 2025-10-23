import Allotment from "@/components/pages/Allotment";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <Allotment />
    </Suspense>
  );
}
