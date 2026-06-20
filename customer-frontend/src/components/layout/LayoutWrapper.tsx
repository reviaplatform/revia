"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import SmoothScroller from "@/components/landing/SmoothScroller";

interface LayoutWrapperProps {
  children: React.ReactNode;
  lang: 'en' | 'ar';
  t: Record<string, any>;
  navbar?: React.ReactNode;
}

export default function LayoutWrapper({ children, lang, t, navbar }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.includes('/dashboard');

  if (isDashboard) {
    return (
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {navbar}
      <SmoothScroller>
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </SmoothScroller>
    </div>
  );
}
