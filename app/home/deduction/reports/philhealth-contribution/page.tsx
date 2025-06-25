import AccessGuard from "@/components/pages/AccessGuard";
import PhilhealthContribution from "@/components/pages/PhilhealthContribution";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <PhilhealthContribution />
    </AccessGuard>
  );
}
