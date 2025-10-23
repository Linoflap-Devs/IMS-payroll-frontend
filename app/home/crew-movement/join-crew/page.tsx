import JoinCrew from "@/components/pages/JoinCrew";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinCrew />
    </Suspense>
  );
}
