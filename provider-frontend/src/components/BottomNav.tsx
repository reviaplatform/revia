'use client';

import React from 'react';
import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import { Widget, Hashtag, Tuning, Settings } from '@solar-icons/react';

import { useTranslations } from 'next-intl';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: Widget },
  { key: 'brand', href: '/dashboard/brand', icon: Hashtag },
  { key: 'repairRequests', href: '/dashboard/repair-requests', icon: Tuning },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-wf-border safe-area-bottom shadow-wf">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {/* Active Indicator bar */}
              <div className={cn(
                "absolute top-0 w-10 h-0.5 rounded-full bg-primary transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              )} />
              
              <div className={cn(
                "p-2 rounded-wf transition-all duration-300",
                isActive ? "bg-primary/10 scale-110" : "bg-transparent scale-100 group-hover:bg-slate-50"
              )}>
                <Icon className={cn("size-6 transition-all", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
