import AccessGuard from "@/components/pages/AccessGuard";
import CrewApplication from "@/components/pages/CrewApplication";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <CrewApplication />
    </AccessGuard>
  );
}
