import AccessGuard from "@/components/pages/AccessGuard";
import Government from "@/components/pages/Government";

export default function page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <Government />
    </AccessGuard>
  );
}
