import AccessGuard from "@/components/pages/AccessGuard";
import Wages from "@/components/pages/Wages";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <Wages />
    </AccessGuard>
  );
}