import AccessGuard from "@/components/pages/AccessGuard";
import PaymentReference from "@/components/pages/PaymentReference";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <PaymentReference />
    </AccessGuard>
  );
}
