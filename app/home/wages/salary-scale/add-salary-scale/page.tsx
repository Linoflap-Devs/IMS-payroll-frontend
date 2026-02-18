import AddSalaryScale from "@/components/pages/AddSalaryScale";
import { Suspense } from "react";

export default function page() {
  return (
     <Suspense fallback={<div></div>}>
      <AddSalaryScale />
    </Suspense>
  );
}