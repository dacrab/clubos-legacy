import {
  BarChart,
  Barcode,
  LayoutDashboard,
  Users,
  History,
  Receipt,
} from "lucide-react";

import type { UserRole } from "@/lib/constants";

// Types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

// Navigation config
export const navigation: NavigationItem[] = [
  {
    name: "Πίνακας",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ['admin', 'employee', 'secretary'],
  },
  {
    name: "Κωδικοί",
    href: "/dashboard/products",
    icon: Barcode,
    roles: ['admin'],
  },
  {
    name: "Ιστορικό",
    href: "/dashboard/history",
    icon: History,
    roles: ['admin'],
  },
  {
    name: "Στατιστικά",
    href: "/dashboard/statistics",
    icon: BarChart,
    roles: ['admin'],
  },
  {
    name: "Χρήστες",
    href: "/dashboard/users",
    icon: Users,
    roles: ['admin'],
  },
  {
    name: "Κλεισίματα Ταμείου",
    href: "/dashboard/register-closings",
    icon: Receipt,
    roles: ['admin'],
  },
];

// Helper functions
export const getVisibleNavItems = (role: string | undefined) => 
  navigation.filter(item => role && item.roles.includes(role as UserRole)); 