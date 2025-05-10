"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronRight as ChevronRightIcon,
  PanelLeft,
  PanelLeftClose,
  Ship,
  HandCoins,
  CircleMinus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiCoinsFill } from "react-icons/ri";
import { TbCurrencyDollarOff } from "react-icons/tb";
import { BiReceipt } from "react-icons/bi";
import { MdOutlinePendingActions } from "react-icons/md";
import { PiClockCounterClockwiseBold } from "react-icons/pi";

// Define the Sidebar component interface
interface SidebarProps {
  routes: {
    label: string;
    icon: React.ElementType;
    href: string;
    active: boolean;
    subItems?: {
      label: string;
      href: string;
      active: boolean;
    }[];
  }[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Sidebar component
function Sidebar({ routes, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({
    // Initialize Deduction dropdown as open by default
    Deduction: true,
  });

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      <div
        className={cn(
          "flex h-full flex-col rounded-xl bg-background text-sidebar-foreground transition-all duration-300 gap-y-3",
          isCollapsed ? "w-18" : "w-full"
        )}
      >
        {/* Logo and Title */}
        <div
          className={cn(
            "flex h-20 items-center bg-[#F9F9F9] rounded-lg shadow-sm",
            isCollapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <div
            className={cn(
              "flex h-15 w-15 items-center justify-center",
              isCollapsed ? "mr-0" : "mr-3"
            )}
          >
            <img
              src="/logo.png"
              alt="Profile Logo"
              className="object-contain h-full w-full"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-sidebar-primary">IMS</h2>
              <p className="text-sm text-sidebar-foreground">Payroll</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-6 bg-[#F9F9F9] rounded-lg shadow-sm">
          <nav className={cn("grid gap-2", isCollapsed ? "px-2" : "px-4")}>
            {routes.map((route) => (
              <div key={route.href}>
                {route.subItems ? (
                  <>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center rounded-lg transition-colors cursor-pointer",
                        isCollapsed ? "justify-center" : "gap-3 px-3",
                        "py-3 text-base font-medium",
                        route.active
                          ? cn(
                              "text-primary bg-white shadow-md font-bold",
                              isCollapsed
                                ? ""
                                : "border-l-4 border-primary pl-2"
                            )
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      onClick={(e) => {
                        if (!isCollapsed) {
                          e.preventDefault();
                          toggleDropdown(route.label);
                        }
                      }}
                      title={isCollapsed ? route.label : ""}
                    >
                      <route.icon
                        className={cn(
                          "h-6 w-6",
                          route.active ? "text-primary" : ""
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{route.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              openDropdowns[route.label]
                                ? "transform rotate-180"
                                : ""
                            )}
                          />
                        </>
                      )}
                    </Link>
                    {!isCollapsed && openDropdowns[route.label] && (
                      <div className="ml-8 mt-1 space-y-1">
                        {route.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "block py-2 pl-3 rounded-lg text-sm",
                              subItem.active
                                ? "bg-white text-primary font-medium shadow-sm"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center rounded-lg transition-colors relative",
                      isCollapsed ? "justify-center" : "gap-3 px-3",
                      "py-3 text-base font-medium",
                      route.active
                        ? cn(
                            "text-primary bg-white shadow-md font-bold",
                            isCollapsed ? "" : "border-l-4 border-primary pl-2"
                          )
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={isCollapsed ? route.label : ""}
                  >
                    <route.icon
                      className={cn(
                        "h-6 w-6",
                        route.active ? "text-primary" : ""
                      )}
                    />
                    {!isCollapsed && route.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div
          className={cn(
            "mt-auto bg-[#F9F9F9] rounded-lg shadow-sm",
            isCollapsed ? "p-2" : "p-4"
          )}
        >
          <div
            className={cn(
              "flex items-center rounded-lg",
              isCollapsed ? "justify-center py-2" : "gap-3 px-3 py-2"
            )}
          >
            <Avatar
              className={cn(
                isCollapsed ? "h-10 w-10 flex-shrink-0" : "flex-shrink-0"
              )}
            >
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-base">
                JD
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <p className="text-base font-medium truncate">John Doe</p>
                  <p className="text-sm text-sidebar-foreground truncate">
                    johndoe@gmail.com
                  </p>
                </div>
                <Link href="/" className="ml-auto flex-shrink-0">
                  <LogOut className="h-5 w-5 text-sidebar-foreground hover:text-sidebar-accent-foreground" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get breadcrumb for current path
  const getBreadcrumb = () => {
    // Handle nested routes
    if (pathname.startsWith("/home/crew/details")) {
      return (
        <div className="flex items-center">
          <Link href="/home/crew" className="hover:text-foreground">
            Crew List
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Crew Details</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/crew/add-crew")) {
      return (
        <div className="flex items-center">
          <Link href="/home/crew" className="hover:text-foreground">
            Crew List
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Add Crew</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/vessel/crew-list")) {
      return (
        <div className="flex items-center">
          <Link href="/home/vessel" className="hover:text-foreground">
            Vessel Profile
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Vessel Crew List</span>
        </div>
      );
    }
    if (pathname === "/home/deduction") {
      return (
        <div className="flex items-center">
          <span className="text-primary">Deduction</span>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Crew Entries</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/deduction/description")) {
      return (
        <div className="flex items-center">
          <Link href="/home/deduction" className="hover:text-foreground">
            Deduction
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Description</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/deduction/deduction-entries")) {
      return (
        <div className="flex items-center">
          <Link href="/home/deduction" className="hover:text-foreground">
            Deduction
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Deduction Entries</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/allotment/allotment_register")) {
      return (
        <div className="flex items-center">
          <Link href="/home/allotment" className="hover:text-foreground">
            Allotment Payroll
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Allotment Register</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/allotment/deduction_register")) {
      return (
        <div className="flex items-center">
          <Link href="/home/allotment" className="hover:text-foreground">
            Allotment Payroll
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Deduction Register</span>
        </div>
      );
    }
    if (pathname.startsWith("/home/allotment/payslip")) {
      return (
        <div className="flex items-center">
          <Link href="/home/allotment" className="hover:text-foreground">
            Allotment Payroll
          </Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" />
          <span className="text-primary">Pay Slip</span>
        </div>
      );
    }

    // Handle regular routes
    const currentRoute = routes.find((route) => route.href === pathname);
    if (currentRoute) return currentRoute.label;

    // Check for subitems
    for (const route of routes) {
      if (route.subItems) {
        const subItem = route.subItems.find((item) => item.href === pathname);
        if (subItem) {
          return (
            <div className="flex items-center">
              <span className="text-muted-foreground">{route.label}</span>
              <ChevronRightIcon className="h-3 w-3 mx-2" />
              <span className="text-primary">{subItem.label}</span>
            </div>
          );
        }
      }
    }

    return "Home";
  };

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/home/dashboard",
      active: pathname.startsWith("/home/dashboard"),
    },
    {
      label: "Crew List",
      icon: Users,
      href: "/home/crew",
      active: pathname.startsWith("/home/crew"),
    },
    {
      label: "Vessel Profile",
      icon: Ship,
      href: "/home/vessel",
      active: pathname.startsWith("/home/vessel"),
    },
    {
      label: "Wages",
      icon: RiCoinsFill,
      href: "/home/wages",
      active: pathname.startsWith("/home/wages"),
    },
    {
      label: "Deduction",
      icon: TbCurrencyDollarOff,
      href: "/home/deduction",
      active: pathname.startsWith("/home/deduction"),
      subItems: [
        {
          label: "Crew Entries",
          href: "/home/deduction",
          active:
            pathname === "/home/deduction" ||
            pathname === "/home/deduction/deduction-entries",
        },
        {
          label: "Description",
          href: "/home/deduction/description",
          active: pathname === "/home/deduction/description",
        },
      ],
    },
    {
      label: "Remittance",
      icon: CircleMinus,
      href: "/home/remittance",
      active: pathname.startsWith("/home/remittance"),
    },
    {
      label: "Allotment Payroll",
      icon: BiReceipt,
      href: "/home/allotment",
      active: pathname.startsWith("/home/allotment"),
    },
    {
      label: "Applications",
      icon: MdOutlinePendingActions,
      href: "/home/application_crew",
      active: pathname.startsWith("/home/application_crew"),
    },
    {
      label: "Audit Log",
      icon: PiClockCounterClockwiseBold,
      href: "/home/audit-log",
      active: pathname.startsWith("/home/audit-log"),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar */}
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
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pl-1 pr-4 py-4">
        <div className="flex flex-col h-full w-full rounded-xl overflow-hidden shadow-sm">
          {/* Breadcrumbs and Toggle Button */}
          <div className="flex items-center p-4 bg-[#F9F9F9] border-b">
            <span
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="cursor-pointer mr-4 hidden md:flex hover:bg-gray-50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  setIsSidebarCollapsed(!isSidebarCollapsed);
              }}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-5 w-5 text-primary" />
              ) : (
                <PanelLeftClose className="h-5 w-5 text-primary" />
              )}
            </span>
            <div className="flex items-center text-base text-muted-foreground">
              <div className="font-medium text-foreground text-sm">
                {getBreadcrumb()}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-[#F9F9F9]">{children}</main>
        </div>
      </div>
    </div>
  );
}
