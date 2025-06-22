'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { useAuth } from '@/src/store/useAuthStore';

interface AccessGuardProps {
  allowedTypes?: number[];
  children: React.ReactNode;
}

export default function AccessGuard({ allowedTypes = [], children }: AccessGuardProps) {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace('/');
    } else if (!allowedTypes.includes(user.UserType)) {
      router.replace('/not-found');
    } else {
      setIsAuthorized(true);
    }
  }, [user, initialized, router, allowedTypes]);

  // Block render if still checking auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
