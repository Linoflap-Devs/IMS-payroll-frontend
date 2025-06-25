import AccessGuard from "@/components/pages/AccessGuard";
import HMDFContribution from "@/components/pages/HDMFContributions";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <HMDFContribution />
    </AccessGuard>
  );
}
