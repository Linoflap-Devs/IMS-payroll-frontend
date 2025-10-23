import GovermentDeductions from "@/components/pages/GovernmentDeductions";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GovermentDeductions />
    </Suspense>
  );
}
