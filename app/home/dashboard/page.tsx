import AccessGuard from "@/components/pages/AccessGuard";
import Dashboard from "@/components/pages/Dashboard";

export default function page() {

  return (
    <AccessGuard allowedTypes={[1, 3, 4, 5]}>
      <Dashboard />
    </AccessGuard>
  );
}
