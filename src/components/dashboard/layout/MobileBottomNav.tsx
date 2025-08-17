"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

import { getVisibleNavItems } from "./navigation.config";

// Types
interface MobileSidebarProps {
  role?: string;
}

export default function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname();
  const visibleNavItems = getVisibleNavItems(role);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const navHeight = navRef.current.offsetHeight;
      document.documentElement.style.setProperty('--mobile-nav-height', `${navHeight}px`);
    }
  }, []);

  return (
    <nav ref={navRef} className="flex items-center justify-between w-full py-2 px-2 sm:p-3">
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg transition-colors flex-1",
              isActive
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            )}
          >
            <div className={cn("relative", isActive && "animate-bounce")}>
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <span className={cn(
              "text-[10px] xs:text-[11px] sm:text-sm font-medium text-center line-clamp-1 transition-all duration-200",
              isActive ? "animate-fade-in" : "opacity-70"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
