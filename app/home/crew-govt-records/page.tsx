import AccessGuard from "@/components/pages/AccessGuard";
import CrewGovtReports from "@/components/pages/CrewGovtReports";

export default function Page() {
  return (
    <AccessGuard allowedTypes={[5]}>
      <CrewGovtReports />
    </AccessGuard>
  );
}