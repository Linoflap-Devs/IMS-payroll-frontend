import UserProfile from "@/components/pages/Profile";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <UserProfile />
    </Suspense>
  );
}