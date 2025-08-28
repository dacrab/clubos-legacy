"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CloseRegisterButton } from "./register/CloseRegisterButton";
import { isUserAuthorized, getVisibleNavItems, NavigationItem } from "./navigation";

// Types
interface SidebarProps {
  role?: string;
}

// Main component
export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const canCloseRegister = isUserAuthorized(role);
  const visibleNavItems = getVisibleNavItems(role);

  // Render methods
  const renderNavItem = (item: NavigationItem, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-soft -translate-y-px"
            : "hover:bg-secondary/80 hover:-translate-y-px hover:shadow-soft"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 transition-all duration-200 group-hover:scale-110",
          isActive && "scale-110"
        )} />
        <span className="transition-transform group-hover:translate-x-0.5">
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 glass-effect border-r shadow-soft hidden lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <Link href="/dashboard" className="block">
            <h1 className="text-2xl font-bold gradient-text hover:scale-[1.02] transition-transform">
              Σύστημα Διαχείρισης
            </h1>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <div className="mb-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Μενού
          </div>
          {visibleNavItems.map(item => renderNavItem(item, pathname === item.href))}
        </nav>

        {canCloseRegister && (
          <div className="border-t p-4 bg-secondary/50">
            <CloseRegisterButton />
          </div>
        )}
      </div>
    </div>
  );
}
