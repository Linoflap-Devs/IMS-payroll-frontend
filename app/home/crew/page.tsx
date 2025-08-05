import AccessGuard from "@/components/pages/AccessGuard";
import CrewList from "@/components/pages/CrewList";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[3, 5]}>
      <CrewList/>
    </AccessGuard>
  );
}