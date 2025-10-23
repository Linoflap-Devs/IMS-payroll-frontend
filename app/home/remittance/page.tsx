import Remittance from "@/components/pages/Remittance";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Remittance />
    </Suspense>
  )
}
