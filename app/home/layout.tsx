"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Menu,
  ChevronRight as ChevronRightIcon,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, logoutUser } from "@/src/services/auth/auth.api";
import { useRouter } from "next/navigation";
import { getHomeRoutes } from "@/src/routes/homeRoutes";
import { getHomeBreadcrumb } from "@/src/routes/getHomeBreadcrumb";
import { Sidebar } from "@/src/routes/sidebar";
import { toast } from "@/components/ui/use-toast";

interface User {
  Email: string
  FirstName: string
  LastName: string
  UserType: number
  UserTypeName: string
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null)
  const userType = user?.UserType;

  useEffect(() => {
    let isMounted = true

    const fetchCurrentUser = async () => {
      try {
        setLoading(true)
        const res = await getCurrentUser()
        if (isMounted) setUser(res)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch current user:", err)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])
  
  const displayUser = useMemo(() => {
    if (!user) {
      return { FirstName: "Guest", LastName: "N/A", Email: "Guest", UserType: 0, UserTypeName: "Unknown" }
    }
    return user
  }, [user])

  const handleLogout = async () => {
    try {
      await logoutUser()
      await fetch("/api/auth/logout", 
        { 
          method: "POST", 
          credentials: "include" 
        })
      toast({
        title: "Logout Successful",
        description: "Successfully logged out.",
      })
      setTimeout(() => router.push("/"), 100)
      
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Logout Failed",
        description: "Something went wrong while logging out.",
        variant: "destructive",
      })
    }
  }
  
  const routes = getHomeRoutes(pathname, userType ?? 1);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-10">
          <Sidebar
            routes={routes}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            user={{
              FirstName: displayUser.FirstName?.toLowerCase() ?? "No First Name",
              LastName: displayUser.LastName?.toLowerCase() ?? "No Last Name",
              UserTypeName: displayUser.UserTypeName?.toLowerCase() ?? "No Position",
              UserType: displayUser.UserType,
              Email: displayUser.Email?.toLowerCase() ?? "No Email",
            }}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:block transition-all duration-300 mr-0",
          isSidebarCollapsed ? "md:w-20 mr-3" : "md:w-64",
          "md:p-4"
        )}
      >
        <Sidebar
          routes={routes}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={{
            FirstName: displayUser.FirstName?.toLowerCase() ?? "No First Name",
            LastName: displayUser.LastName?.toLowerCase() ?? "No Last Name",
            UserTypeName: displayUser.UserTypeName?.toLowerCase() ?? "No Position",
            UserType: displayUser.UserType,
            Email: displayUser.Email?.toLowerCase() ?? "No Email",
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pl-1 pr-4 py-4">
        <div className="flex flex-col h-full w-full rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center p-4 bg-[#F9F9F9] border-b">
            <span
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="cursor-pointer mr-4 hidden md:flex hover:bg-gray-50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-5 w-5 text-primary" />
              ) : (
                <PanelLeftClose className="h-5 w-5 text-primary" />
              )}
            </span>
            <div className="flex items-center text-base text-muted-foreground">
              <div className="font-medium text-foreground text-sm">
                {getHomeBreadcrumb(pathname, userType ?? 1)}
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-auto bg-[#F9F9F9]">{children}</main>
        </div>
      </div>
    </div>
  );
}
