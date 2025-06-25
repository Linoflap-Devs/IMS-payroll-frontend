import AccessGuard from "@/components/pages/AccessGuard";
import GovermentDeductions from "@/components/pages/GovernmentDeductions";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <GovermentDeductions />
    </AccessGuard>
  );
}
