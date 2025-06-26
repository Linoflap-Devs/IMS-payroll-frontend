import AccessGuard from "@/components/pages/AccessGuard";
import ManageUsers from "@/components/pages/ManageUsers";

export default function page() {
  return (
    <AccessGuard allowedTypes={[1]}>
      <ManageUsers />
    </AccessGuard>
  );
}
