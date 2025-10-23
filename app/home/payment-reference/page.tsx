import PaymentReference from "@/components/pages/PaymentReference";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentReference />
    </Suspense>
  );
}
