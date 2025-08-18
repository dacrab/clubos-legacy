'use client';

import React from 'react';
import { Copyright, Github, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useDashboard } from '@/components/dashboard/provider/DashboardProvider';

interface FooterClientProps {
  year: number;
}

export default function FooterClient({ year }: FooterClientProps) {
  let isSidebarVisible = false;
  try {
    const dashboard = useDashboard();
    isSidebarVisible = dashboard.isSidebarVisible;
  } catch {
    // It's ok to fail, it means we are not in a dashboard page.
  }

  return (
    <footer
      className={cn(
        'bg-background w-full shrink-0 border-t',
        isSidebarVisible && 'lg:pl-72',
        'pb-mobile-nav lg:pb-0' // Add padding to the bottom on mobile to avoid overlap with mobile nav
      )}
    >
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col items-center justify-between gap-2 px-4 py-3 text-base sm:flex-row">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-muted-foreground/80 flex items-center gap-1.5 text-xs font-light">
            <Copyright className="text-muted-foreground/80 h-4 w-4" />
            <span>
              Copyright <span className="text-primary/90 font-bold">{year}</span>
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-end">
          <span className="text-muted-foreground/80 flex items-center gap-1.5 text-xs font-light">
            <Sparkles className="h-4 w-4 animate-pulse text-yellow-400" />
            <span>
              Designed <span className="text-primary/90 font-bold">&</span> Developed by
            </span>
          </span>
          <a
            href="https://github.com/dacrab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-base font-medium transition-colors"
          >
            <Github className="h-5 w-5" />
            DaCrab
          </a>
        </div>
      </div>
    </footer>
  );
}
