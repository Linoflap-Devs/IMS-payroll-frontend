import AccessGuard from "@/components/pages/AccessGuard";
import VesselProfile from "@/components/pages/VesselProfile";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <VesselProfile />
    </AccessGuard>
  );
}
