import AccessGuard from "@/components/pages/AccessGuard";
import CrewEntries from "@/components/pages/CrewEntries";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 5]}>
      <CrewEntries />
    </AccessGuard>
  );
}
