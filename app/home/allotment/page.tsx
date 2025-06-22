import AccessGuard from "@/components/pages/AccessGuard";
import Allotment from "@/components/pages/Allotment";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      <Allotment />
    </AccessGuard>
  );
}
