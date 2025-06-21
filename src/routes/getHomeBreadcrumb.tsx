import Link from "next/link";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import { getHomeRoutes } from "./homeRoutes";

export const getHomeBreadcrumb = (pathname: string) => {
  const routes = getHomeRoutes(pathname);

  const match = (base: string, label: string) => (
    <div className="flex items-center">
      <Link href={base} className="hover:text-foreground">{label}</Link>
      <ChevronRightIcon className="h-3 w-3 mx-2" />
      <span className="text-primary">{pathname.split("/").pop()?.replace(/_/g, " ")}</span>
    </div>
  );

  if (pathname.startsWith("/home/crew/details")) return match("/home/crew", "Crew List");
  if (pathname.startsWith("/home/crew/add-crew")) return match("/home/crew", "Crew List");
  if (pathname.startsWith("/home/vessel/crew-list")) return match("/home/vessel", "Vessel Profile");
  if (pathname.startsWith("/home/deduction/description")) return match("/home/deduction", "Deduction");
  if (pathname.startsWith("/home/deduction/deduction-entries")) return match("/home/deduction", "Deduction");
  if (pathname.startsWith("/home/allotment/allotment_register")) return match("/home/allotment", "Allotment Payroll");
  if (pathname.startsWith("/home/allotment/deduction_register")) return match("/home/allotment", "Allotment Payroll");
  if (pathname.startsWith("/home/allotment/payslip")) return match("/home/allotment", "Allotment Payroll");

  // fallback: check against route config
  const route = routes.find(r => r.href === pathname);
  if (route) return route.label;

  for (const route of routes) {
    if (route.subItems) {
      const sub = route.subItems.find(s => s.href === pathname);
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
