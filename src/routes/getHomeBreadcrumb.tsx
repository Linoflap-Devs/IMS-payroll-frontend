import Link from "next/link";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import { getHomeRoutes } from "./homeRoutes";

export const getHomeBreadcrumb = (pathname: string, userType: number) => {
  const routes = getHomeRoutes(pathname, userType);

  const match = (base: string, baseLabel: string, currentLabel?: string) => (
    <div className="flex items-center">
      <Link href={base} className="hover:text-foreground">{baseLabel}</Link>
      <ChevronRightIcon className="h-3 w-3 mx-2" />
      <span className="text-primary">
        {currentLabel ?? pathname.split("/").pop()?.replace(/_/g, " ")}
      </span>
    </div>
  );

  if (pathname.startsWith("/home/crew/details")) return match("/home/crew", "Crew List", "Crew Details");
  if (pathname.startsWith("/home/crew/add-crew")) return match("/home/crew", "Crew List", "Add Crew");
  if (pathname.startsWith("/home/vessel/crew-list")) return match("/home/vessel", "Vessel Profile", "View Crew List");
  if (pathname.startsWith("/home/deduction/description")) return match("/home/deduction", "Deduction", "Deduction Description");
  if (pathname.startsWith("/home/deduction/deduction-entries")) return match("/home/deduction", "Deduction", "Deduction Entries");
  if (pathname.startsWith("/home/allotment/allotment_register")) return match("/home/allotment", "Allotment Payroll", "Allotment Register");
  if (pathname.startsWith("/home/allotment/deduction_register")) return match("/home/allotment", "Allotment Payroll", "Deduction Register");
  if (pathname.startsWith("/home/allotment/payslip")) return match("/home/allotment", "Allotment Payroll", "Allotment Payslip");
  if (pathname.startsWith("/home/remittance/details")) return match("/home/remittance", "Remittance", "Crew Remittance Details");
  if (pathname.startsWith("/home/profile")) { return match("/home/profile", "Profile", "User Profile");}
  if (pathname.startsWith("/home/crew-payroll/history")) return match("/home/crew-payroll",  "Crew Payroll", "Crew Payroll History");

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
