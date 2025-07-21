"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/store/useAuthStore";
import { getCurrentUser } from "@/src/services/auth/auth.api";

export default function AppInitializer() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setInitialized, setLoading, initialized } = useAuth();

  useEffect(() => {
    const init = async () => {
      setLoading(true); // show spinner

      try {
        const fetchedUser = await getCurrentUser();
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          router.replace("/"); // no session
        }
      } catch {
        router.replace("/");
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    // Run only if not yet initialized
    if (!initialized) {
      init();
    }
  }, [initialized]);

  // After initialized and `user` exists, and on login page? Redirect!
  useEffect(() => {
    if (initialized && user && pathname === "/") {
      router.replace("/home/dashboard");
    }
  }, [initialized, user, pathname]);

  return null;
}
