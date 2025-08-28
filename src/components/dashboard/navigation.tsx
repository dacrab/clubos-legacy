import {
  BarChart,
  Barcode,
  LayoutDashboard,
  Users,
  History,
  Receipt,
} from "lucide-react";
import { ALLOWED_USER_ROLES } from "@/lib/constants";

// Types
export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  show: (role: string | undefined) => boolean;
}

// Navigation config
export const navigation: NavigationItem[] = [
  {
    name: "Πίνακας",
    href: "/dashboard",
    icon: LayoutDashboard,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0] || role === ALLOWED_USER_ROLES[1] || role === ALLOWED_USER_ROLES[2],
  },
  {
    name: "Κωδικοί",
    href: "/dashboard/codes",
    icon: Barcode,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0],
  },
  {
    name: "Ιστορικό",
    href: "/dashboard/history",
    icon: History,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0],
  },
  {
    name: "Στατιστικά",
    href: "/dashboard/statistics",
    icon: BarChart,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0],
  },
  {
    name: "Χρήστες",
    href: "/dashboard/users",
    icon: Users,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0],
  },
  {
    name: "Κλεισίματα Ταμείου",
    href: "/dashboard/register-closings",
    icon: Receipt,
    show: (role: string | undefined) => role === ALLOWED_USER_ROLES[0],
  },
];

// Helper functions
export const isUserAuthorized = (role: string | undefined) => 
  role === ALLOWED_USER_ROLES[0] || role === ALLOWED_USER_ROLES[1] || role === ALLOWED_USER_ROLES[2];

export const getVisibleNavItems = (role: string | undefined) => 
  navigation.filter(item => item.show(role)); 