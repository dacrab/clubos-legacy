'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileNavVariants } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/format';

import { getVisibleNavItems } from './navigation';

// Types
type MobileSidebarProps = {
  role?: string;
};

export default function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname();
  const visibleNavItems = getVisibleNavItems(role);

  return (
    <nav className="flex w-full items-center justify-between px-2 py-2 sm:p-3">
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors sm:gap-1.5 sm:p-3',
              isActive
                ? 'bg-primary/5 text-primary'
                : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
            )}
            href={item.href}
            key={item.href}
          >
            <motion.div
              animate={isActive ? 'active' : 'inactive'}
              className="relative"
              variants={mobileNavVariants.icon}
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>

            <motion.span
              animate={isActive ? 'active' : 'inactive'}
              className="line-clamp-1 text-center font-medium text-[10px] xs:text-[11px] sm:text-sm"
              variants={mobileNavVariants.text}
            >
              {item.name}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
