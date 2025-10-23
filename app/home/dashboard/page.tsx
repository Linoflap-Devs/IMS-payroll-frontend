import Dashboard from "@/components/pages/Dashboard";
import { Suspense } from "react";

export default function page() {
  return (
   <Suspense fallback={<div> Loading... </div>}>
      <Dashboard />
   </Suspense> 
  );
}
