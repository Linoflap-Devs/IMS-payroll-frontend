'use client';

import { useRouter } from 'next/navigation';

interface AccessGuardProps {
  allowedTypes?: number[];
  children: React.ReactNode;
}

export default function AccessGuard({ allowedTypes = [], children }: AccessGuardProps) {
  const router = useRouter();


  return <>{children}</>;
}
