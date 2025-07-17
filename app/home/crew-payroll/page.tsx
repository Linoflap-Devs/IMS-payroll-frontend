import AccessGuard from "@/components/pages/AccessGuard";
import CrewPayroll from "@/components/pages/CrewPayroll";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <CrewPayroll />
    </AccessGuard>
  );
}
