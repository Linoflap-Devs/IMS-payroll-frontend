import LoginHistory from "@/components/pages/LoginHistory";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginHistory />
    </Suspense>
  );
}
