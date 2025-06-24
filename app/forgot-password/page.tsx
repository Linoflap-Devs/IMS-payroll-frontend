import AccessGuard from "@/components/pages/AccessGuard";
export default function page() {
  return (
    <AccessGuard allowedTypes={[3, 4]}>
      {
        <>
          {/* added placeholder here to prevent error on building */}
          <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        </>
      }
    </AccessGuard>
  );
}
