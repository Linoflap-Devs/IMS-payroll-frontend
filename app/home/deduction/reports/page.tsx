import GovernmentReports from "@/components/pages/GovernmentReports";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GovernmentReports />
    </Suspense>
  );
}
