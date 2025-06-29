import AccessGuard from "@/components/pages/AccessGuard";
import LoginHistory from "@/components/pages/LoginHistory";

export default function page() {
  return (
    <AccessGuard allowedTypes={[1]}>
      <LoginHistory />
    </AccessGuard>
  );
}
