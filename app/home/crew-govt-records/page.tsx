import AccessGuard from "@/components/pages/AccessGuard";
import CrewGovtRecords from "@/components/pages/CrewGovtRecords";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <CrewGovtRecords />
    </AccessGuard>
  );
}