import ManageUsers from "@/components/pages/ManageUsers";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageUsers />
    </Suspense>
  );
}
