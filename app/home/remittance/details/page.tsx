import RemittanceDetails from "@/components/pages/RemittanceDetails";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemittanceDetails />
    </Suspense>
  );
}
