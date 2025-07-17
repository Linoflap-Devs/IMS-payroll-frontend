import AccessGuard from "@/components/pages/AccessGuard";
import CrewPayrollHistory from "@/components/pages/CrewPayrollHistory";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <CrewPayrollHistory />
    </AccessGuard>
  );
}
