import WagesForex from "@/components/pages/Forex";
import { Suspense } from "react";

export default function page() {
  return (
     <Suspense fallback={<div></div>}>
      <WagesForex />
    </Suspense>
  );
}