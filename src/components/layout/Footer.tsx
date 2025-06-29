"use client";

import React from "react";
import { Github, Copyright, Sparkles } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { cn } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();
  const { isSidebarVisible } = useDashboard();

  return (
    <footer className={cn(
      "w-full border-t bg-background shrink-0",
      isSidebarVisible && "lg:pl-72",
      "pb-mobile-nav lg:pb-0" // Add padding to the bottom on mobile to avoid overlap with mobile nav
    )}>
      <div className="mx-auto max-w-screen-xl flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 text-base">
        <div className="flex flex-col items-center sm:items-start">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-light">
            <Copyright className="h-4 w-4 text-muted-foreground/80" />
            <span>
              Copyright <span className="font-bold text-primary/90">{year}</span>
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-end">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-light">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span>
              Designed <span className="font-bold text-primary/90">&</span> Developed by
            </span>
          </span>
          <a
            href="https://github.com/dacrab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 transition-colors text-base"
          >
            <Github className="h-5 w-5" />
            DaCrab
          </a>
        </div>
    </div>
    </footer>
  );
} 