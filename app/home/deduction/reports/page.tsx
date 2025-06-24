import AccessGuard from "@/components/pages/AccessGuard";
import GovernmentReports from "@/components/pages/GovernmentReports";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <GovernmentReports />
    </AccessGuard>
  );
}
