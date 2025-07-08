"use client";

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import { getHomeRoutes } from "./homeRoutes";

interface BreadcrumbProps {
  userType: number;
}

export const Breadcrumb = ({ userType }: BreadcrumbProps) => {
  const router = useRouter();
  const { pathname, query, isReady } = router;
  const [breadcrumb, setBreadcrumb] = useState<JSX.Element | string>("");

  useEffect(() => {
    if (!isReady) return;

    const tab = query.tab as string | undefined;
    const result = getHomeBreadcrumb(pathname, userType, tab);
    setBreadcrumb(result);
  }, [isReady, pathname, query.tab, userType]);

  return <div className="mb-4">{breadcrumb}</div>;
};

// ------------------------
// Breadcrumb logic
// ------------------------

export const getHomeBreadcrumb = (
  pathname: string,
  userType: number,
  queryTab?: string
) => {
  const routes = getHomeRoutes(pathname, userType);

  const match = (
    base: string,
    baseLabel: string,
    currentLabel?: string
  ) => (
    <div className="flex items-center">
      <Link href={base} className="hover:text-foreground">
        {baseLabel}
      </Link>
      <ChevronRightIcon className="h-3 w-3 mx-2" />
      <span className="text-primary">
        {currentLabel ?? pathname.split("/").pop()?.replace(/_/g, " ")}
      </span>
    </div>
  );

  if (pathname.startsWith("/home/crew/details")) {
    console.log("DEBUG - pathname:", pathname);
    console.log("DEBUG - queryTab:", queryTab);
    console.log("DEBUG - normalized tab:", queryTab?.toLowerCase());

    const tab = queryTab?.toLowerCase();
    switch (tab) {
      case "details":
        return match("/home/crew", "Crew List", "Crew Details");
      case "movement":
        return match("/home/crew", "Crew List", "Crew Movement");
      case "allottee":
        return match("/home/crew", "Crew List", "Crew Allottee");
      case "validation":
        return match("/home/crew", "Crew List", "Crew Validation");
      default:
        console.log("TAB not matched. Falling to default case.");
        return match("/home/crew", "Crew List", "Crew Details");
    }
  }

  if (pathname.startsWith("/home/crew/add-crew"))
    return match("/home/crew", "Crew List");
  if (pathname.startsWith("/home/vessel/crew-list"))
    return match("/home/vessel", "Vessel Profile");
  if (pathname.startsWith("/home/deduction/description"))
    return match("/home/deduction", "Deduction");
  if (pathname.startsWith("/home/deduction/deduction-entries"))
    return match("/home/deduction", "Deduction");
  if (pathname.startsWith("/home/allotment/allotment_register"))
    return match("/home/allotment", "Allotment Payroll");
  if (pathname.startsWith("/home/allotment/deduction_register"))
    return match("/home/allotment", "Allotment Payroll");
  if (pathname.startsWith("/home/allotment/payslip"))
    return match("/home/allotment", "Allotment Payroll");

  // fallback: check against route config
  const route = routes.find((r) => r.href === pathname);
  if (route) return route.label;

  for (const route of routes) {
    if (route.subItems) {
      const sub = route.subItems.find((s) => s.href === pathname);
      if (sub) {
        return (
          <div className="flex items-center">
            <span className="text-muted-foreground">{route.label}</span>
            <ChevronRightIcon className="h-3 w-3 mx-2" />
            <span className="text-primary">{sub.label}</span>
          </div>
        );
      }
    }
  }

  return "Home";
};
