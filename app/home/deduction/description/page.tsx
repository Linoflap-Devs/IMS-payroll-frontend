import AccessGuard from "@/components/pages/AccessGuard";
import DeductionDescription from "@/components/pages/DeductionDescription";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <DeductionDescription />
    </AccessGuard>
  );
}
