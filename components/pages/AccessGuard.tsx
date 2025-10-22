"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/store/useAuthStore";
import { getCurrentUser } from "@/src/services/auth/auth.api";

interface AccessGuardProps {
  allowedTypes?: number[];
  children: React.ReactNode;
}

export default function AccessGuard({ allowedTypes = [], children }: AccessGuardProps) {
  const router = useRouter();
  //const { user, setUser } = useAuth();
  //const [authorized, setAuthorized] = useState<boolean | null>(null);

  // useEffect(() => {
  //   const checkAccess = async () => {
  //     try {
  //       let currentUser = user;

  //       // If no user in Zustand, try fetching from API
  //       if (!currentUser) {
  //         const fetched = await getCurrentUser();
  //         if (!fetched) {
  //           router.push("/not-found");
  //           return;
  //         }

  //         currentUser = {
  //           email: fetched.Email,
  //           userType: fetched.UserType,
  //         };

  //         setUser(currentUser);
  //       }

  //       // If user type not allowed → redirect
  //       if (allowedTypes.length && !allowedTypes.includes(Number(currentUser?.userType))) {
  //         router.push("/not-found");
  //         return;
  //       }

  //       setAuthorized(true);
  //     } catch (error) {
  //       console.error("[AccessGuard] Session check failed:", error);
  //       router.push("/");
  //     }
  //   };

  //   checkAccess();
  // }, [user, allowedTypes, router, setUser]);

  // if (authorized === null) {
  //   return <div>Loading...</div>;
  // }

  return <>{children}</>
}
