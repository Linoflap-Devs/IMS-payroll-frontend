import AccessGuard from "@/components/pages/AccessGuard";
import SSSContribution from "@/components/pages/SSSContribution";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <SSSContribution />
    </AccessGuard>
  );
}
