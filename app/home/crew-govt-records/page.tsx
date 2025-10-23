import CrewGovtRecords from "@/components/pages/CrewGovtRecords";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <CrewGovtRecords />
    </Suspense>
  );
}