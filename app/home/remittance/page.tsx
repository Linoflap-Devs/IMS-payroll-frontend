import AccessGuard from "@/components/pages/AccessGuard";
import Remittance from "@/components/pages/Remittance";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Remittance />;
    </AccessGuard>
  )
}
