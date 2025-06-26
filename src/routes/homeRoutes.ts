import { LayoutDashboard, Users, Ship, CircleMinus, UserCheck } from "lucide-react";
import { RiCoinsFill } from "react-icons/ri";
import { TbCurrencyDollarOff } from "react-icons/tb";
import { BiReceipt } from "react-icons/bi";
import { MdOutlinePendingActions } from "react-icons/md";
import { PiClockCounterClockwiseBold } from "react-icons/pi";

export const getHomeRoutes = (pathname: string, userType: number) => {
  const allRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/home/dashboard",
      active: pathname.startsWith("/home/dashboard"),
      allowedUserTypes: [1, 3, 4, 5],
    },
    {
      label: "Crew List",
      icon: Users,
      href: "/home/crew",
      active: pathname.startsWith("/home/crew"),
      allowedUserTypes: [3],
    },
    {
      label: "Vessel Profile",
      icon: Ship,
      href: "/home/vessel",
      active: pathname.startsWith("/home/vessel"),
      allowedUserTypes: [3],
    },
    {
      label: "Wages",
      icon: RiCoinsFill,
      href: "/home/wages",
      active: pathname.startsWith("/home/wages"),
      allowedUserTypes: [3],
    },  
    {
      label: "Deduction",
      icon: TbCurrencyDollarOff,
      href: "/home/deduction",
      active: pathname.startsWith("/home/deduction"),
      allowedUserTypes: [3, 5],
      subItems: [
        {
          label: "Crew Entries",
          href: "/home/deduction",
          active:
            pathname === "/home/deduction" ||
            pathname === "/home/deduction/deduction-entries",
          allowedUserTypes: [3],
        },
        {
          label: "Description",
          href: "/home/deduction/description",
          active: pathname === "/home/deduction/description",
          allowedUserTypes: [3],
        },
        {
          label: "Government",
          href: "/home/deduction/government-deductions",
          active: pathname === "/home/deduction/government-deductions",
          allowedUserTypes: [5],
        },
        {
          label: "Reports",
          href: "/home/deduction/reports",
          active: pathname === "/home/deduction/reports",
          allowedUserTypes: [5],
        },
      ],
    },
    {
      label: "Remittance",
      icon: CircleMinus,
      href: "/home/remittance",
      active: pathname.startsWith("/home/remittance"),
      allowedUserTypes: [3],
    },
    {
      label: "Allotment Payroll",
      icon: BiReceipt,
      href: "/home/allotment",
      active: pathname.startsWith("/home/allotment"),
      allowedUserTypes: [3, 4],
    },
    {
      label: "Applications",
      icon: MdOutlinePendingActions,
      href: "/home/application_crew",
      active: pathname.startsWith("/home/application_crew"),
      allowedUserTypes: [3],
    },
    {
      label: "Audit Log",
      icon: PiClockCounterClockwiseBold,
      href: "/home/audit-log",
      active: pathname.startsWith("/home/audit-log"),
      allowedUserTypes: [1],
    },
    {
      label: "Manage Users",
      icon: UserCheck,
      href: "/home/manage-users",
      active: pathname.startsWith("/home/manage-users"),
      allowedUserTypes: [1],
    },
  ];

  // Filter routes based on user type
  const filteredRoutes = allRoutes
    .filter((route) => route.allowedUserTypes.includes(userType))
    .map((route) => ({
      ...route,
      // Filter subItems as well, if they exist
      subItems: route.subItems?.filter((sub) =>
        sub.allowedUserTypes.includes(userType)
      ),
    }));

  return filteredRoutes;
};
