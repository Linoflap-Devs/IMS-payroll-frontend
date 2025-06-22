import AccessGuard from "@/components/pages/AccessGuard";
import RemittanceDetails from "@/components/pages/RemittanceDetails";
export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <RemittanceDetails />
    </AccessGuard>
  );
}
