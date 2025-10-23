import AddCrew from "@/components/pages/AddCrew";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div> Loading... </div>}>
      <AddCrew />
    </Suspense>
  )
}
