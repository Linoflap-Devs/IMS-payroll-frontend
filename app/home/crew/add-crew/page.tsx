import AccessGuard from "@/components/pages/AccessGuard";
import AddCrew from "@/components/pages/AddCrew";

export default function page() {
  return (
    <AccessGuard allowedTypes={[3]}>
      <AddCrew />
    </AccessGuard>
  )
}
