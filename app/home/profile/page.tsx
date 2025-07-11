import AccessGuard from "@/components/pages/AccessGuard";
import UserProfile from "@/components/pages/Profile";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[1, 3, 4, 5, 6]}>
        <UserProfile />
    </AccessGuard>
  );
}