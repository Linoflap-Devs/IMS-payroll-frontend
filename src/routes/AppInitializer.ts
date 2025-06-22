"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/store/useAuthStore";
import { getCurrentUser } from "@/src/services/auth/auth.api";

export default function AppInitializer() {
  const pathname = usePathname();
  const { setUser, setInitialized, setLoading, user } = useAuth();

  useEffect(() => {
    const init = async () => {
      const isPublicRoute = pathname === "/" || pathname === "/register";

      if (isPublicRoute) {
        setInitialized(true);
        setLoading(false);
        return;
      }

      if (user) {
        // User is already set (e.g., from login)
        setInitialized(true);
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user); // fallback for refresh
        } else {
          setInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        setInitialized(true);
        setLoading(false);
      }
    };

    init();
  }, [pathname, user, setUser, setInitialized, setLoading]);

  return null;
}
