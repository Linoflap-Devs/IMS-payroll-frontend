import WagesDescription from "@/components/pages/WagesDescription";
import { Suspense } from "react";

export default function page() {
  return (
     <Suspense fallback={<div></div>}>
      <WagesDescription />
    </Suspense>
  );
}