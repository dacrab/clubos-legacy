"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getVisibleNavItems } from "./navigation";
import { mobileNavVariants } from "@/lib/animations";

// Types
interface MobileSidebarProps {
  role?: string;
}

export default function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname();
  const visibleNavItems = getVisibleNavItems(role);

  return (
    <nav className="flex items-center justify-between w-full py-2 px-2 sm:p-3">
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
            <motion.div
              variants={mobileNavVariants.icon}
              animate={isActive ? "active" : undefined}
              className="relative"
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>

            <motion.span 
              variants={mobileNavVariants.text}
              animate={isActive ? "active" : "inactive"}
              className="text-[10px] xs:text-[11px] sm:text-sm font-medium text-center line-clamp-1"
            >
              {item.name}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
